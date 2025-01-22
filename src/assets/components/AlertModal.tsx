import {ReactElement} from "react";
import {Button, ButtonProps, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";

interface AlertModalProps
{
    isOpen: boolean;
    onClose: () => void;
    message: string;
    buttons?: ReactElement<ButtonProps>[] | ReactElement<ButtonProps>;
}

export default function AlertModal(props: AlertModalProps)
{
    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title={"Alert"}
            size={"sm"}
        >
            <ModalContent>
                <ModalHeader>Alert</ModalHeader>
                <ModalBody>
                    <p>{props.message}</p>
                </ModalBody>
                <ModalFooter>
                    {props.buttons ?? <Button onClick={props.onClose}>Close</Button>}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}