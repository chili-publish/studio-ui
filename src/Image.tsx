import React from 'react';

function Image(props: any) {
    const { src } = props;
    return (
        <>
            <img alt="variable" src={src} />
            <input type="file" />
        </>
    );
}

export default Image;
