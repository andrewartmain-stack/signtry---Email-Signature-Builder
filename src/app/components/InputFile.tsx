import { FC } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputFileProps {
    label: string;
    userDataProperty: "photoUrl" | "bannerUrl" | "companyLogoUrl";
    onFileChange: (file: File | null, userDataProperty: "photoUrl" | "bannerUrl" | "companyLogoUrl") => void;
}

const InputFile: FC<InputFileProps> = ({ label, userDataProperty, onFileChange }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file, userDataProperty);
    };

    return (
        <div className="flex flex-col w-full items-start gap-2">
            <Label htmlFor="picture">{label}</Label>
            <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="flex-1/2"
            />
        </div>
    )
}

export default InputFile