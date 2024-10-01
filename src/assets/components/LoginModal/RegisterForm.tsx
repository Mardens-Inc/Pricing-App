import {Button, Input, ModalBody, ModalFooter} from "@nextui-org/react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelope, faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {useEffect, useState} from "react";

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

    useEffect(() =>
    {
        setHasLowercase(/[a-z]/.test(password));
        setHasUppercase(/[A-Z]/.test(password));
        setHasNumber(/[0-9]/.test(password));
        setHasSpecial(/[!@#$%^&*]/.test(password));
        setIsCommon(commonPasswords.some(commonPassword => password.includes(commonPassword)));
        setIsLongEnough(password.length >= 8);
        setPasswordsMatch(password === confirmPassword);
        setIsValid(hasLowercase && hasUppercase && hasNumber && hasSpecial && !isCommon && isLongEnough && passwordsMatch);
    }, [password, confirmPassword]);


    return (
        <>
            <ModalBody>
                <Input
                    autoFocus
                    endContent={
                        <FontAwesomeIcon icon={faEnvelope} height={14} className="text-default-400 pointer-events-none flex-shrink-0"/>
                    }
                    label="First and Last Name"
                    placeholder="Enter your firstname.lastname"
                    variant="bordered"
                    isRequired
                    value={username}
                    onValueChange={setUsername}
                />
                <Input
                    endContent={
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} height={14} className="text-default-400 cursor-pointer flex-shrink-0" onClick={() => setShowPassword(prev => !prev)}/>
                    }
                    label="Password"
                    placeholder="Enter your password"
                    variant="bordered"
                    type={showPassword ? "text" : "password"}
                    isRequired
                    value={password}
                    onValueChange={setPassword}
                />
                <Input
                    endContent={
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} height={14} className="text-default-400 cursor-pointer flex-shrink-0" onClick={() => setShowConfirmPassword(prev => !prev)}/>
                    }
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="bordered"
                    isRequired
                    value={confirmPassword}
                    onValueChange={setConfirmPassword}
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

            </ModalBody>
            <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                </Button>
                <Button color="primary" onPress={onClose} isDisabled={!isValid}>
                    Register
                </Button>
            </ModalFooter>
        </>
    );
}