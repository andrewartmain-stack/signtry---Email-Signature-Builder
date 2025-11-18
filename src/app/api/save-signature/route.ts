import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';
import { extractLinksFromHtml } from '../../utils/extractLinksFromHtml';
import { v4 as uuidv4 } from 'uuid';

const SIGNATURE_LIMITS: Record<string, number> = {
  [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_MONTHLY!]: 5, // Basic monthly
  [process.env.NEXT_PUBLIC_PRICE_ID_BASIC_YEARLY!]: 5, // Basic yearly
  [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_MONTHLY!]: 50, // Professional monthly
  [process.env.NEXT_PUBLIC_PRICE_ID_PROFESSIONAL_YEARLY!]: 50, // Professional yearly
  ['unlimited_edition_for_admin_only']: 10000, // Admin Only
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('price_id')
      .eq('id', user.id)
      .single();

    const priceId = profile?.price_id;

    const limit = SIGNATURE_LIMITS[priceId] ?? 5;

    const { count } = await supabase
      .from('saved_signatures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const signaturesCount = count ?? 0;

    if (signaturesCount >= limit) {
      return NextResponse.json(
        { message: `You have reached the limit (${limit}) for your plan.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    let signatureHtml = body.signatureHtml;
    const photoUrl = body.photoUrl;
    const signatureImageUrl = body.signatureImageUrl;
    const companyLogoUrl = body.companyLogoUrl;
    const bannerUrl = body.bannerUrl;

    // 1️⃣ Извлекаем ссылки из HTML
    const links = extractLinksFromHtml(signatureHtml);

    // 2️⃣ Генерируем токены для каждой ссылки и создаём объект для вставки
    const linksWithTokens = links.map((link) => {
      const token = uuidv4(); // уникальный токен для каждой ссылки
      return {
        link_key: link.id,
        target_url: link.href,
        token,
      };
    });

    // 3️⃣ Заменяем href в HTML на /r/<token>
    linksWithTokens.forEach((link) => {
      // простой replace, предполагаем что link.href уникален
      signatureHtml = signatureHtml.replace(
        new RegExp(`href="${link.target_url}"`, 'g'),
        `href="api/r/${link.token}"`
      );
    });

    // 4️⃣ Сохраняем подпись с уже обновлённым HTML
    const { data: savedSignature, error: savedSignatureError } = await supabase
      .from('saved_signatures')
      .insert({
        html: signatureHtml,
        photoUrl,
        signatureImageUrl,
        bannerUrl,
        companyLogoUrl,
        user_id: user.id,
      })
      .select()
      .single();

    if (savedSignatureError) {
      console.error(savedSignatureError.message);
      return NextResponse.json(
        { message: savedSignatureError.message },
        { status: 500 }
      );
    }

    // 5️⃣ Добавляем signature_id к ссылкам и вставляем в базу
    const insertLinksData = linksWithTokens.map((link) => ({
      signature_id: savedSignature.id,
      link_key: link.link_key,
      target_url: link.target_url,
      token: link.token,
    }));

    const { error: linksInsertError } = await supabase
      .from('signature_links')
      .insert(insertLinksData);

    if (linksInsertError) {
      console.error(linksInsertError.message);
      return NextResponse.json(
        { message: linksInsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Signature saved successfully!' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
