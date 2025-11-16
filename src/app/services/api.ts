import { uploadImageToBucket } from '../utils/uploadImageToBucket';
import { renderSignature } from '../utils/renderSignature';
import { FormUserDataInterface } from '../types';

export async function saveSignature(
  userData: FormUserDataInterface,
  htmlSignature: string,
  bucketName: string
) {
  try {
    if (userData) {
      const photoUrlResponse = await uploadImageToBucket(
        userData.photoUrl,
        bucketName
      );
      const photoUrl = await photoUrlResponse.json();

      const signatureImageUrlResponse = await uploadImageToBucket(
        userData.signatureImageUrl,
        bucketName
      );
      const signatureImageUrl = await signatureImageUrlResponse.json();

      let bannerUrlResponse;

      if (userData.bannerUrl) {
        bannerUrlResponse = await uploadImageToBucket(
          userData.bannerUrl,
          bucketName
        );
      }

      let companyLogoUrlResponse;

      if (userData.companyLogoUrl) {
        companyLogoUrlResponse = await uploadImageToBucket(
          userData.companyLogoUrl,
          bucketName
        );
      }

      const bannerUrl = await bannerUrlResponse?.json();

      const companyLogoUrl = await companyLogoUrlResponse?.json();

      const response = await fetch('/api/save-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signatureHtml: renderSignature(htmlSignature, {
            ...userData,
            photoUrl: photoUrl.url,
            signatureImageUrl: signatureImageUrl.url,
            bannerUrl: bannerUrl ? bannerUrl.url : '',
            companyLogoUrl: companyLogoUrl ? companyLogoUrl.url : '',
          }),
          photoUrl: photoUrl.url,
          signatureImageUrl: signatureImageUrl.url,
          bannerUrl: bannerUrl ? bannerUrl.url : '',
          companyLogoUrl: companyLogoUrl ? companyLogoUrl.url : '',
        }),
      });

      return response;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }
  }
}

export async function generateSignatureImage(fullName: string) {
  try {
    const response = await fetch('/api/generate-signature-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName,
      }),
    });

    const responseData = await response.json();
    const url = responseData.url;

    return url;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }
  }
}

// export async function fetchInitialData() {
//   try {
//     const userResponse = await fetch('/api/get-user');
//     const userData = await userResponse.json();
//     const templatesResponse = await fetch('/api/get-templates');
//     const templatesData = await templatesResponse.json();
//     const badgeTemplatesResponse = await fetch('/api/get-badge-templates');
//     const badgeTemplatesData = await badgeTemplatesResponse.json();
//     const socialIconsResponse = await fetch('/api/get-social-icons');
//     const socialIconsData = await socialIconsResponse.json();

//     if (
//       !(
//         userData.userData &&
//         templatesData.templates &&
//         badgeTemplatesData.badgeTemplates &&
//         socialIconsData.socialIcons
//       )
//     ) {
//       console.error('Failed fetching initial data');
//       return;
//     }

//     return {
//       userData: userData.userData,
//       templates: templatesData.templates,
//       badgeTemplates: badgeTemplatesData.badgeTemplates,
//       socialIcons: socialIconsData.socialIcons,
//     };
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(error.message);
//       throw error;
//     }
//   }
// }

export async function deleteSignature(id: number) {
  try {
    const response = await fetch(`/api/delete-signature?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function fetchSignatures() {
  try {
    const signaturesResponse = await fetch('api/get-saved-signatures');
    const signaturesData = await signaturesResponse.json();

    return signaturesData.signatures;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      throw error;
    }
  }
}
