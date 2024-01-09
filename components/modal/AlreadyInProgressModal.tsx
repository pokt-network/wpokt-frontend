import { Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, ModalProps, Button, Box, ButtonGroup } from "@chakra-ui/react";
import { BluePoktIcon } from "../icons/pokt";
import { useAccount, useBalance } from "wagmi";
import { useGlobalContext } from "@/context/Globals";


export function AlreadyInProgressModal(props: ModalProps) {
    const {
        destination,
        poktAddress,
        poktAmount,
        wPoktAmount
    } = useGlobalContext()

    const { address } = useAccount()

    return (
        <Modal {...props} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader textAlign="center" color="poktLime">YOU HAVE A BRIDGE IN PROGRESS</ModalHeader>
                <ModalCloseButton color="poktLime" _hover={{ color: "poktBlue" }} />
                <ModalBody padding={0}>
                    <Flex
                        direction="column"
                        bg="darkOverlay"
                        justify="center"
                        align="center"
                        padding={4}
                        paddingX={8}
                        gap={2}
                        mb={10}
                    >
                        <BluePoktIcon />
                        <Text color="poktLime" fontSize={18} fontWeight={"bold"}>
                            Please review this bridge before proceeding.
                        </Text>
                        <Box>
                            <Text>
                                You have a bridge in progress to:
                            </Text>
                            <Text textAlign='center'>{destination === 'pokt' ? poktAddress : address}</Text>
                            <Text>
                                for {destination === 'pokt' ? `${wPoktAmount.toString()} wPOKT` : `${poktAmount.toString()} POKT`}. You can start a new bridge, but we recommend waiting until this one has completed.
                            </Text>
                        </Box>
                        <ButtonGroup mt={3}>
                            <Button
                                bg="poktLime"
                            >
                                {destination === 'pokt' ? 'Unwrap' : 'Wrap'}
                            </Button>
                            <Button
                                variant="outline"
                                borderColor="poktLime"
                                bg="transparent"
                                color="white"
                            >
                                Cancel
                            </Button>
                        </ButtonGroup>
                    </Flex>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
