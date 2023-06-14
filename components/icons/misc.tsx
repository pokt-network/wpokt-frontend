import { Icon, IconProps } from "@chakra-ui/react";

export const ErrorIcon = (props: IconProps) => (
    <Icon width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>        
        <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M6.5 13C10.0899 13 13 10.0899 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13ZM5.57143 2.32143C5.57143 1.80859 5.98716 1.39286 6.5 1.39286C7.01284 1.39286 7.42857 1.80859 7.42857 2.32143V7.42857C7.42857 7.94141 7.01284 8.35714 6.5 8.35714C5.98716 8.35714 5.57143 7.94141 5.57143 7.42857V2.32143ZM7.42857 10.6786C7.42857 11.1914 7.01284 11.6071 6.5 11.6071C5.98716 11.6071 5.57143 11.1914 5.57143 10.6786C5.57143 10.1657 5.98716 9.75 6.5 9.75C7.01284 9.75 7.42857 10.1657 7.42857 10.6786Z"
            fill={typeof props.fill === "string" ? props.fill : "#F93232"}
        />
    </Icon>
)

export const BlueCheckIcon = (props: IconProps) => (
    <Icon width="50" height="50" viewBox="0 0 50 50" {...props}>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M25 50C38.8071 50 50 38.8071 50 25C50 11.1929 38.8071 0 25 0C11.1929 0 0 11.1929 0 25C0 38.8071 11.1929 50 25 50ZM39.756 18.5071L25.8664 32.3967L22.0784 36.1847L18.2903 32.3967L10.7141 24.8205L14.5022 21.0325L22.0784 28.6086L35.968 14.719L39.756 18.5071Z"
            fill="#1D8AED"
        />
    </Icon>
)