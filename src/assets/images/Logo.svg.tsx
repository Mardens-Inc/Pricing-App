interface logoIconProperties
{
    width?: number | string;
    height?: number | string;
    size?: number | string;
}

export default function Logo(props: logoIconProperties)
{
    return (
        <svg width={props.size || props.width || "106"} height={props.size || props.height || "106"} viewBox="0 0 106 106" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M53 3L96.3013 28V78L53 103L9.69873 78V28L53 3Z" fill="hsl(356.27, 83.55%, 20%)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M53 8.7735L14.6987 30.8868V75.1133L53 97.2265L91.3013 75.1133V30.8868L53 8.7735ZM96.3013 28L53 3L9.69873 28V78L53 103L96.3013 78V28Z" fill="hsl(var(--heroui-primary))"/>
            <path
                d="M53.0819 28.592C59.6099 28.592 64.4819 30.008 67.6979 32.84C70.9619 35.672 72.5939 39.704 72.5939 44.936C72.5939 47.288 72.2579 49.544 71.5859 51.704C70.9139 53.816 69.8099 55.736 68.2739 57.464C66.7859 59.144 64.7939 60.488 62.2979 61.496C59.8019 62.456 56.7299 62.936 53.0819 62.936H49.1939V80H35.2979V28.592H53.0819ZM52.7939 39.824H49.1939V51.632H51.9299C53.1299 51.632 54.2339 51.44 55.2419 51.056C56.2979 50.624 57.1379 49.952 57.7619 49.04C58.3859 48.08 58.6979 46.832 58.6979 45.296C58.6979 43.664 58.2179 42.344 57.2579 41.336C56.2979 40.328 54.8099 39.824 52.7939 39.824Z"
                fill="hsl(var(--heroui-primary))"/>
        </svg>
    );
}