import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../utils/supabase/server';
import { getSignatureQuota } from '../../utils/signatureLimits';
import { trackSignatureLinks } from '../../utils/trackSignatureLinks';
import {
  getSignatureHtmlWarnings,
  ImageSizes,
  optimizeSignatureHtml,
} from '../../utils/optimizeSignatureHtml';

// One request saves up to this many signatures (bulk generation sends chunks)
const MAX_SIGNATURES_PER_REQUEST = 25;

interface SignatureToSave {
  html: string;
  photoUrl?: string;
  signatureImageUrl?: string;
  bannerUrl?: string;
  companyLogoUrl?: string;
  imageSizes?: ImageSizes;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const signatures: SignatureToSave[] = Array.isArray(body.signatures) ? body.signatures : [];

    if (
      signatures.length === 0 ||
      signatures.length > MAX_SIGNATURES_PER_REQUEST ||
      signatures.some((signature) => typeof signature?.html !== 'string' || !signature.html)
    ) {
      return NextResponse.json({ message: 'Invalid signatures payload' }, { status: 400 });
    }

    const { limit, remaining } = await getSignatureQuota(supabase, user.id);

    if (signatures.length > remaining) {
      return NextResponse.json(
        {
          message:
            remaining === 0
              ? `You have reached the limit (${limit}) for your plan.`
              : `Your plan allows ${remaining} more signature${remaining === 1 ? '' : 's'} (limit ${limit}).`,
          remaining,
        },
        { status: 403 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    // Track links (needs the ids), then optimize for email clients (drops ids)
    const prepared = signatures.map((signature) => {
      const { html, links } = trackSignatureLinks(signature.html, baseUrl);
      return {
        html: optimizeSignatureHtml(html, signature.imageSizes ?? {}),
        links,
        row: {
          photoUrl: signature.photoUrl ?? '',
          signatureImageUrl: signature.signatureImageUrl ?? '',
          bannerUrl: signature.bannerUrl ?? '',
          companyLogoUrl: signature.companyLogoUrl ?? '',
          user_id: user.id,
        },
      };
    });

    const { data: savedSignatures, error: savedSignatureError } = await supabase
      .from('saved_signatures')
      .insert(prepared.map((item) => ({ ...item.row, html: item.html })))
      .select('id, html');

    if (savedSignatureError || !savedSignatures) {
      console.error(savedSignatureError?.message);
      return NextResponse.json(
        { message: savedSignatureError?.message ?? 'Could not save signatures' },
        { status: 500 }
      );
    }

    // Each html contains unique link tokens, so it identifies its row reliably
    const idByHtml = new Map(savedSignatures.map((saved) => [saved.html as string, saved.id]));

    const insertLinksData = prepared.flatMap((item) =>
      item.links.map((link) => ({ ...link, signature_id: idByHtml.get(item.html) }))
    );

    if (insertLinksData.length > 0) {
      const { error: linksInsertError } = await supabase
        .from('signature_links')
        .insert(insertLinksData);

      if (linksInsertError) {
        console.error(linksInsertError.message);
        // Without link rows every tracked link would be dead, so roll back
        await supabase
          .from('saved_signatures')
          .delete()
          .in('id', savedSignatures.map((saved) => saved.id))
          .eq('user_id', user.id);

        return NextResponse.json({ message: linksInsertError.message }, { status: 500 });
      }
    }

    revalidatePath('/signatures');
    revalidatePath('/analytics');

    return NextResponse.json(
      {
        message:
          signatures.length === 1
            ? 'Signature saved successfully!'
            : `${signatures.length} signatures saved successfully!`,
        ids: prepared.map((item) => idByHtml.get(item.html)),
        // Final, tracked html so the client can copy it right after saving
        htmls: prepared.map((item) => item.html),
        warnings: [...new Set(prepared.flatMap((item) => getSignatureHtmlWarnings(item.html)))],
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Could not save signatures' }, { status: 500 });
  }
}
