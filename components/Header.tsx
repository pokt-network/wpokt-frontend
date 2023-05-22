import { Button, ButtonGroup, HStack } from "@chakra-ui/react";
import Image from "next/image";
import { EthIcon } from "./icons/eth";
import { PoktIcon } from "./icons/pokt";
import logo from "../public/logo/full_white.png";


export function Header() {
    return (
        <HStack justify="space-between" align="center" paddingX={10} paddingY={5}>
            <Image src={logo} alt="logo" width={122} height={36} />
            <ButtonGroup>
                <Button
                    borderWidth={2}
                    borderColor="poktLime"
                >
                    Buy POKT
                </Button>
                <Button
                    borderWidth={2}
                    borderColor="poktLime"
                >
                    Buy wPOKT
                </Button>
                <Button
                    color="darkBlue"
                    background="poktLime"
                    borderWidth={2}
                    borderColor="poktLime"
                    leftIcon={<EthIcon />}
                >
                    Connect
                </Button>
                <Button
                    color="darkBlue"
                    background="poktLime"
                    borderWidth={2}
                    borderColor="poktLime"
                    leftIcon={<PoktIcon />}
                >
                    Connect
                </Button>
            </ButtonGroup>
        </HStack>
    )
}