import React from 'react';
import reactCSS, { Classes } from 'reactcss';
import { SketchPicker, SketchPickerProps } from 'react-color';
import { SketchPickerStylesProps } from 'react-color/lib/components/sketch/Sketch';

export function ColorPicker(props: SketchPickerProps) {
    const [show, setShow] = React.useState(false);
    // const [color, setColor] = React.useState({
    //     r: 241,
    //     g: 112,
    //     b: 19,
    //     a: 1,
    // });

    // React.useEffect(() => {
    //     if (props.color) {
    //         setColor(props.color)
    //     }
    // })

    const handleClick = () => {
        setShow(!show);
    };

    const handleClose = () => {
        setShow(false);
    };

    // const handleChangeComplete = (color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (props.onChangeComplete) {
    //         props.onChangeComplete(color, event);
    //     }
    // };

    // const handleChange = (color: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (props.onChange) {
    //         props.onChange(color, event);
    //     }
    // };

    const styles = reactCSS({
        'default': {
            color: {
                width: '36px',
                height: '14px',
                borderRadius: '2px',
                background: `${props.color}`,
            },
            swatch: {
                padding: '5px',
                background: '#343B41',
                borderRadius: '1px',
                boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                display: 'inline-block',
                cursor: 'pointer',
            },
            popover: {
                position: 'absolute' as 'absolute',
                zIndex: 2,
            },
            cover: {
                position: 'fixed' as 'fixed',
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px',
            },
        },
    });

    const pickerStyle: Partial<Classes<SketchPickerStylesProps>> = {// can't seem to change the damn text colors in the picker; i don't really understand this object, either
        'default': {
            picker: {
                background: `#485969`,
                color: `#787878`,
            },
        },
    };

    return (
        <div>
            <div style={styles.swatch} onClick={handleClick}>
                <div className="sm-miniswatch" style={styles.color} />
            </div>
            {show ? <div style={styles.popover}>
                <div style={styles.cover} onClick={handleClose} />
                <SketchPicker /* color={color} onChange={handleChange} onChangeComplete={handleChangeComplete} */ {...props} styles={pickerStyle} />
            </div> : null}

        </div>
    )
}
