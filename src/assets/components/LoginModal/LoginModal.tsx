import {Modal, ModalContent, Tab, Tabs} from "@nextui-org/react";
import LoginForm from "./LoginForm.tsx";
import RegisterForm from "./RegisterForm.tsx";

export default function LoginModal({isOpen, onClose}: { isOpen: boolean, onClose: () => void })
{
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent className={"pt-2"}>
                {onClose => (

                    <Tabs
                        className={"ml-4"}
                        variant={"underlined"}
                          classNames={{
                              tab: "flex py-4 px-6 flex-initial text-large font-semibold"
                          }}>
                        <Tab title="Login"><LoginForm onClose={onClose}/></Tab>
                        <Tab title="Register"><RegisterForm onClose={onClose}/></Tab>
                    </Tabs>

                )}
            </ModalContent>
        </Modal>
    );
}