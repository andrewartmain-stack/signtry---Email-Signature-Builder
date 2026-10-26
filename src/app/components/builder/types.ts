import { FormUserDataInterface } from '../../types';
import { BuilderOptions, DesignIssue } from '../../utils/signatureDesign';

export interface StepProps {
  design: FormUserDataInterface;
  updateDesign: (patch: Partial<FormUserDataInterface>) => void;
  options: BuilderOptions;
  updateOptions: (patch: Partial<BuilderOptions>) => void;
  issues: DesignIssue[];
}

export function fieldError(issues: DesignIssue[], field: string) {
  return issues.find((issue) => issue.field === field)?.message;
}
