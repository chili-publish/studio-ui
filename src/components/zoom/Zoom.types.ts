export enum ZoomTypeEnum {
    INCREMENT = 'INCREMENT',
    DECREMENT = 'DECREMENT',
}

export interface ZoomButtonProps {
    type?: ZoomTypeEnum;
    handleOnClick: (type?: ZoomTypeEnum) => void;
}
