import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import {useAuth} from "../../providers/AuthProvider.tsx";
import {Button, Checkbox, Input, Link, ModalBody, ModalFooter, Tooltip} from "@heroui/react";


export default function LoginForm({onClose}: { onClose: () => void })
{
    const {auth, setIsLoggedIn} = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);


    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const login = async () =>
    {
        setError(null);
        setUsernameError(null);
        setPasswordError(null);
        if (username == "" || password == "")
        {
            if (username == "") setUsernameError("Username is required");
            if (password == "") setPasswordError("Password is required");
            return;
        }

        setLoading(true);
        const expiration = rememberMe ? 60 * 60 * 24 * 30 : -1; // 30 days expiration if remember me is checked
        try
        {
            const response = await auth.login(username, password, expiration);

            if (response.success)
            {
                setIsLoggedIn(true);
                onClose();
            } else
            {
                setError(response.message);
                if (response.message.includes("username"))
                {
                    setUsernameError("Invalid username or email");
                }
                if (response.message.includes("password"))
                {
                    setPasswordError("Invalid password");
                }
            }


            setLoading(false);
        } catch (e: any | Error)
        {
            console.error("Failed to login", e);
            setError(e.message);
        }
    };

    const keyup = async (e: React.KeyboardEvent<HTMLInputElement>) =>
    {
        if (e.key === "Enter")
        {
            await login();
        } else if (e.currentTarget instanceof HTMLInputElement)
        {
            const input = e.currentTarget as HTMLInputElement;
            if (usernameError && input.id === "username-input-field") setUsernameError(null);
            if (passwordError && input.id === "password-input-field") setPasswordError(null);
        }
    };

    return (
        <>
            <ModalBody>
                <Input
                    id={"username-input-field"}
                    isRequired
                    autoFocus
                    endContent={
                        <FontAwesomeIcon icon={faEnvelope} height={14} className="text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    label="Username"
                    placeholder="Enter your username or email"
                    variant="bordered"
                    value={username}
                    onValueChange={setUsername}
                    onKeyUp={keyup}
                    isInvalid={!!usernameError}
                    errorMessage={usernameError}
                />
                <Input
                    id={"password-input-field"}
                    isRequired
                    endContent={
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} height={14} className="text-default-400 cursor-pointer flex-shrink-0" onClick={() => setShowPassword(prev => !prev)}/>
                    }
                    label="Password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                    value={password}
                    onValueChange={setPassword}
                    onKeyUp={keyup}
                    isInvalid={!!passwordError}
                    errorMessage={passwordError}
                />
                <div className="flex py-2 px-1 justify-between">
                    <Tooltip content={"This will keep you logged in for 30 days"} delay={1500}>
                        <Checkbox
                            checked={rememberMe}
                            onValueChange={setRememberMe}
                            classNames={{
                                label: "text-small"
                            }}
                        >
                            Remember me
                        </Checkbox>
                    </Tooltip>
                    <Link color="primary" href="#" size="sm">
                        Forgot password?
                    </Link>
                </div>
                <p className={"text-danger"}>{error}</p>
            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="flat" onClick={onClose} radius={"full"}>
                    Close
                </Button>
                <Button color="primary" isLoading={loading} isDisabled={!username || !password} onClick={login} radius={"full"}>
                    Log in
                </Button>
            </ModalFooter>
        </>
    );
}