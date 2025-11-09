import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: userProfile, error: errorGettingUserProfile } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();

    if (errorGettingUserProfile) {
      console.error(errorGettingUserProfile.message);
      return NextResponse.json(
        { message: errorGettingUserProfile.message },
        { status: 500 }
      );
    }

    const formData = await req.formData();

    const fullName = formData.get('fullname') as string;
    const avatarFile = formData.get('avatar') as File;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const messages: string[] = [];

    // === Avatar Update ===
    if (avatarFile && avatarFile.size) {
      const { data: files } = await supabase.storage
        .from('images')
        .list(`avatars/${user.id}`, { limit: 100, offset: 0 });

      if (files) {
        const filePaths = files.map(
          (file) => `avatars/${user.id}/${file.name}`
        );

        const { error: removeError } = await supabase.storage
          .from('images')
          .remove(filePaths);

        if (removeError) {
          console.error(removeError.message);
        }
      }

      let avatarUrl = '';
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(`avatars/${user.id}/${avatarFile.name}`, avatarFile);

      if (uploadError) {
        console.error(uploadError.message);
      }

      if (uploadData) {
        avatarUrl = supabase.storage
          .from('images')
          .getPublicUrl(`avatars/${user.id}/${avatarFile.name}`).data.publicUrl;

        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id)
          .select()
          .single();

        if (profileUpdateError) {
          console.error(profileUpdateError.message);
        } else {
          messages.push('Avatar updated');
        }
      }
    }

    // === Full Name Update ===
    if (fullName && fullName !== userProfile.full_name && fullName.trim()) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (profileError) {
        console.error(profileError.message);
      } else {
        messages.push('Full name updated');
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (authError) {
        console.error(authError.message);
      }
    }

    // === Email Update ===
    if (email && email.trim() && user.email !== email) {
      const { error: updateEmailError } = await supabase.auth.updateUser({
        email,
      });

      if (updateEmailError) {
        console.error(updateEmailError.message);
      } else {
        messages.push('Confirmation link for email update was sent!');
      }
    }

    // === Password Update ===
    if (password && password.trim() && password.length >= 8) {
      const { error: updatePasswordError } = await supabase.auth.updateUser({
        password,
      });

      if (updatePasswordError) {
        console.error(updatePasswordError.message);
      } else {
        messages.push('Password updated');
      }
    }

    // === Return response ===
    return NextResponse.json(
      { message: messages.length ? messages : 'No changes made' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
