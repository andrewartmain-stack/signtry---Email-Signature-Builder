import React, { FC } from 'react'

import Signature from './Signature';

import { renderSignature } from '../utils/renderSignature';

import { FormUserDataInterface, SignatureTemplateInterface } from '../types';

const TemplatesList: FC<{ templates: SignatureTemplateInterface[], currentTemplatesCategory: string, demoUserData: FormUserDataInterface, handleSetCurrentHtmlSignature: (html: string) => void }> = ({ templates, currentTemplatesCategory, demoUserData, handleSetCurrentHtmlSignature }) => {


    return (
        <div className="w-full flex gap-3 flex-wrap">
            {templates.map((template) => {
                if (template.alignment === currentTemplatesCategory) {
                    const signatureHtml = renderSignature(template.html, { ...demoUserData });

                    return (
                        <div
                            key={template.id}
                            className="cursor-pointer rounded-sm shadow-md hover:shadow-xl bg-white p-2 transition-transform hover:-translate-y-1 border-1 border-gray-400"
                            onClick={() => handleSetCurrentHtmlSignature(template.html)}
                        >
                            <Signature html={signatureHtml} />
                        </div>
                    );
                }
            })}
        </div>

    )
}

export default React.memo(TemplatesList);