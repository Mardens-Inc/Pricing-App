import React, {useEffect, useState} from "react";
import {useAuth} from "../../providers/AuthProvider.tsx";
import {Button, Input, ModalBody, ModalFooter} from "@heroui/react";
import {Icon} from "@iconify/react";

export default function RegisterForm({onClose}: { onClose: () => void })
{
    const commonPasswords = ["!@#$%^&*", "000000", "111111", "1111111", "121212", "123", "123123", "123321", "1234", "12345", "123456", "1234567", "12345678", "123456789", "1234567890", "123qwe", "18atcskd2w", "1q2w3e", "1q2w3e4r", "1q2w3e4r5t", "1qaz2wsx", "3rjs1la7qe", "555555", "654321", "666666", "696969", "7777777", "987654321", "aa123456", "aa12345678", "abc123", "access", "admin", "adobe123", "ashley", "azerty", "baseball", "batman", "donald", "dragon", "flower", "football", "freedom", "google", "hottie", "iloveyou", "key123", "letmein", "login", "loveme", "master", "michael", "monkey", "mustang", "mynoob", "ninja", "passw0rd", "password", "password1", "password123", "photoshop", "princess", "qazwsx", "qwerty", "qwerty123", "qwertyuiop", "shadow", "solo", "starwars", "sunshine", "superman", "trustno1", "welcome", "whatever", "zaq1zaq1", "zxcvbnm", "super", "cool"];
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hasLowercase, setHasLowercase] = useState(false);
    const [hasUppercase, setHasUppercase] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [hasSpecial, setHasSpecial] = useState(false);
    const [isCommon, setIsCommon] = useState(false);
    const [isLongEnough, setIsLongEnough] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(password === confirmPassword);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {auth, setIsLoggedIn} = useAuth();

    useEffect(() =>
    {
        const isLowercase = /[a-z]/.test(password);
        const isUppercase = /[A-Z]/.test(password);
        const isNumber = /[0-9]/.test(password);
        const isSpecial = /[!@#$%^&*]/.test(password);
        const isPasswordCommon = commonPasswords.some(commonPassword => password.includes(commonPassword));
        const isPasswordLongEnough = password.length >= 8;
        const matches = password === confirmPassword;

        setHasLowercase(isLowercase);
        setHasUppercase(isUppercase);
        setHasNumber(isNumber);
        setHasSpecial(isSpecial);
        setIsCommon(isPasswordCommon);
        setIsLongEnough(isPasswordLongEnough);
        setPasswordsMatch(matches);
        setIsValid(username !== "" && isLowercase && isUppercase && isNumber && isSpecial && !isPasswordCommon && isPasswordLongEnough && matches);
    }, [username, password, confirmPassword]);

    const register = async () =>
    {
        try
        {
            const response = await auth.register(username, password);
            if (!response)
            {
                setError("An error occurred while registering.");
                return;
            }

            if (response.success)
            {
                const loginResponse = await auth.loginWithToken(response.user);
                if (loginResponse)
                {
                    setIsLoggedIn(true);
                    onClose();
                } else
                {
                    setError("An error occurred while logging in.");
                }

                onClose();
            } else
            {
                setError(response.message);
            }


        } catch (e: any | Error)
        {
            setError(e.message);
        }
    };

    const handleKeyUp = async (e: React.KeyboardEvent<HTMLInputElement>) =>
    {
        if (isValid && e.key === "Enter")
        {
            await register();
        }

    };


    return (
        <>
            <ModalBody>
                <Input
                    autoFocus
                    endContent={
                        <Icon icon="mage:email-fill" height={14} className="text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    label="First and Last Name"
                    placeholder="Enter your firstname.lastname"
                    variant="bordered"
                    isRequired
                    value={username}
                    onValueChange={setUsername}
                    onKeyUp={handleKeyUp}
                />
                <Input
                    endContent={
                        <Icon icon={showPassword ? "mage:eye-off" : "mage:eye-fill"} height={14} className="text-default-400 cursor-pointer flex-shrink-0" onClick={() => setShowPassword(prev => !prev)}/>
                    }
                    label="Password"
                    placeholder="Enter your password"
                    variant="bordered"
                    type={showPassword ? "text" : "password"}
                    isRequired
                    value={password}
                    onValueChange={setPassword}
                    onKeyUp={handleKeyUp}
                />
                <Input
                    endContent={
                        <Icon icon={showPassword ? "mage:eye-off" : "mage:eye-fill"} height={14} className="text-default-400 cursor-pointer flex-shrink-0" onClick={() => setShowConfirmPassword(prev => !prev)}/>
                    }
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="bordered"
                    isRequired
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
                    onKeyUp={handleKeyUp}
                />

                <div id="password-validation">
                    <h3>Password must contain the following:</h3>
                    <p className={hasLowercase ? "valid text-success" : "invalid text-danger"} id="letter">A <b>lowercase</b> letter</p>
                    <p className={hasUppercase ? "valid text-success" : "invalid text-danger"} id="capital">A <b>capital (uppercase)</b> letter</p>
                    <p className={hasNumber ? "valid text-success" : "invalid text-danger"} id="number">A <b>number</b></p>
                    <p className={hasSpecial ? "valid text-success" : "invalid text-danger"} id="special">A <b>special</b> character, like !@#$%^&*?</p>
                    <p className={isCommon ? "invalid text-danger" : "valid text-success"} id="common">No <b>common</b> passwords, like 123 or password</p>
                    <p className={isLongEnough ? "valid text-success" : "invalid text-danger"} id="length">Minimum <b>8 characters</b></p>
                    <p className={passwordsMatch ? "valid text-success" : "invalid text-danger"} id="match">Passwords <b>match</b></p>
                </div>
                <p className={"italic text-danger"}>{error}</p>

            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose} radius={"full"}>
                    Close
                </Button>

                <Button color="primary" onPress={register} isDisabled={!isValid} radius={"full"}>
                    Register
                </Button>
            </ModalFooter>
        </>
    );
}