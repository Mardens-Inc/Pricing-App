import {Button, Checkbox, Input, Link, ModalBody, ModalFooter} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";

export default function LoginForm({onClose}: { onClose: () => void })
{
    const [showPassword, setShowPassword] = useState(false);
    return (
        <>
            <ModalBody>
                <Input
                    isRequired
                    autoFocus
                    endContent={
                        <FontAwesomeIcon icon={faEnvelope} height={14} className="text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    label="Email"
                    placeholder="Enter your email"
                    variant="bordered"
                />
                <Input
                    isRequired
                    endContent={
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} height={14} className="text-default-400 cursor-pointer flex-shrink-0" onClick={() => setShowPassword(prev => !prev)}/>
                    }
                    label="Password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                />
                <div className="flex py-2 px-1 justify-between">
                    <Checkbox
                        classNames={{
                            label: "text-small"
                        }}
                    >
                        Remember me
                    </Checkbox>
                    <Link color="primary" href="#" size="sm">
                        Forgot password?
                    </Link>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                </Button>
                <Button color="primary" onPress={onClose}>
                    Log in
                </Button>
            </ModalFooter>
        </>
    );
}