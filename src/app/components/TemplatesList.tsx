import React, { FC } from 'react'

import Signature from './Signature';

import { renderSignature } from '../utils/renderSignature';

import { FormUserDataInterface, SignatureTemplateInterface } from '../types';

const TemplatesList: FC<{ templates: SignatureTemplateInterface[], currentTemplatesCategory: string, demoUserData: FormUserDataInterface, handleSetCurrentHtmlSignature: (html: string) => void }> = ({ templates, currentTemplatesCategory, demoUserData, handleSetCurrentHtmlSignature }) => {


    return (
        <div className="w-full scrollable-x">
            <div className='flex gap-3 w-max'>
                {templates.map((template) => {
                    if (template.alignment === currentTemplatesCategory) {
                        const signatureHtml = renderSignature(template.html, { ...demoUserData });

                        return (
                            <div
                                key={template.id}
                                className="cursor-pointer rounded-sm shadow-md bg-white p-2 transition-transform border-1 border-gray-400"
                                onClick={() => handleSetCurrentHtmlSignature(template.html)}
                            >
                                <Signature html={signatureHtml} />
                            </div>
                        );
                    }
                })}
            </div>
        </div>

    )
}

export default React.memo(TemplatesList);