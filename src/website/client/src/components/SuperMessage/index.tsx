import React from 'react';
import './SuperMessage.css';
import { DashboardMessage } from "../../../../../gm";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWindowClose } from '@fortawesome/pro-duotone-svg-icons';
import chroma from 'chroma-js';

interface SuperMessageProps {
    value: DashboardMessage;
    set(message: DashboardMessage): any;
}

export function SuperMessage(props: SuperMessageProps) {
    const { value, set } = props;
    const [showing, setShowing] = React.useState<boolean>(false);
    const [em, setEm] = React.useState("");
    const [mc, setMc] = React.useState("");

    React.useEffect(() => {
        if (showing) {
            setTimeout(() => setMc("opaque"), 100)
        } else {
            setTimeout(() => setMc(""), 100)
        }
    }, [showing]);

    const handleCancelClick = () => {
        setShowing(false);
        // set({ outside: "", embed: {} });
        setEm("");
    }

    const handleShowClick = () => {
        handleCancelClick();
        if (!showing) {
            setShowing(true);
        }
    }

    const handleOutsideChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 2000) {
            set({
                ...value,
                outside: e.target.value
            });
        }
    }

    const handleColorAspectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const col = chroma(e.target.value);
        const numform = col.num();
        console.log(numform)
        if (numform !== value.embed.color) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    color: numform
                }
            });
        }
    }

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    authoricon: e.target.value
                }
            });
        } else if (value.embed.authoricon) {
            delete value.embed.authoricon;
            set({
                ...value,
                embed: {
                    ...value.embed,
                }
            });
        }
    }

    const handleAuthorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 256) {
            if (e.target.value) {
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                        authorname: e.target.value
                    }
                });
            } else if (value.embed.authorname) {
                delete value.embed.authorname;
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                    }
                });
            }
        }
    }

    const handleAuthorURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    authorurl: e.target.value
                }
            });
        } else if (value.embed.authorurl) {
            delete value.embed.authorurl;
            set({
                ...value,
                embed: {
                    ...value.embed,
                }
            });
        }
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 256) {
            if (e.target.value) {
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                        title: e.target.value
                    }
                });
            } else if (value.embed.title) {
                delete value.embed.title;
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                    }
                });
            }
        }
    }

    const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    url: e.target.value
                }
            });
        } else if (value.embed.url) {
            delete value.embed.url;
            set({
                ...value,
                embed: {
                    ...value.embed,
                }
            });
        }
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 2048) {
            if (e.target.value) {
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                        description: e.target.value
                    }
                });
            } else if (value.embed.description) {
                delete value.embed.description;
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                    }
                });
            }
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    imageurl: e.target.value
                }
            });
        } else if (value.embed.imageurl) {
            delete value.embed.imageurl;
            set({
                ...value,
                embed: {
                    ...value.embed,
                }
            });
        }
    }

    const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    thumbnailurl: e.target.value
                }
            });
        } else if (value.embed.thumbnailurl) {
            delete value.embed.thumbnailurl;
            set({
                ...value,
                embed: {
                    ...value.embed,
                }
            });
        }
    }

    const handleFootChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 2048) {
            if (e.target.value) {
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                        footertext: e.target.value
                    }
                });
            } else if (value.embed.footertext) {
                delete value.embed.footertext;
                set({
                    ...value,
                    embed: {
                        ...value.embed,
                    }
                });
            }
            // set({
            //     ...value,
            //     embed: {
            //         ...value.embed,
            //         footertext: e.target.value
            //     }
            // });
        }
    }

    const handleFootIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    footericon: e.target.value
                }
            });
        } else if (value.embed.footericon) {
            delete value.embed.footericon;
            set({
                ...value,
                embed: {
                    ...value.embed,
                }
            });
        }
    }

    //icon
    //author
    //authorurl
    //title
    //url
    //description
    //image
    //thumb
    //foot
    //footicon
    //field name
    //field value

    const handleFieldAdd = () => {
        if ((value.embed.fields?.length ?? 0) < 25) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    fields: [
                        ...(value.embed.fields ?? []),
                        { name: "", value: "", inline: false }
                    ]
                }
            });
        }
        // const m = Object.assign({}, value);
        // if (!m.embed.fields) {
        //     m.embed.fields = [];
        // }
        // if (m.embed.fields.length < 25) {
        //     m.embed.fields.push({ name: "", value: "", inline: false });
        // }
        // set(m);
    }

    const handleFieldNameChange = (e: React.ChangeEvent<HTMLInputElement>,id: number) => {
        if (value.embed.fields && value.embed.fields.length && e.target.value.length <= 256) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    fields: [
                        ...value.embed.fields.filter((x, i) => i !== id),
                        { name: e.target.value, value: value.embed.fields[id].value, inline: value.embed.fields[id].inline }
                    ]
                }
            });
        }
    }

    const handleFieldValueChange = (e: React.ChangeEvent<HTMLInputElement>,id: number) => {
        // const m = Object.assign({}, value);
        // if (m.embed.fields && m.embed.fields.length && e.target.value.length <= 1024) {
        //     m.embed.fields[id].value = e.target.value;
        //     set(m);
        // }
        if (value.embed.fields && value.embed.fields.length && e.target.value.length <= 1024) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    fields: [
                        ...value.embed.fields.filter((x, i) => i !== id),
                        { name: value.embed.fields[id].name, value: e.target.value, inline: value.embed.fields[id].inline }
                    ]
                }
            });
        }
    }

    const handleFieldInlineChange = (e: React.ChangeEvent<HTMLInputElement>,id: number) => {
        // const m = Object.assign({}, value);
        // if (m.embed.fields && m.embed.fields.length) {
        //     m.embed.fields[id].inline = e.target.checked;
        //     set(m);
        // }
        if (value.embed.fields && value.embed.fields.length) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    fields: [
                        ...value.embed.fields.filter((x, i) => i !== id),
                        { name: value.embed.fields[id].name, value: value.embed.fields[id].value, inline: e.target.checked }
                    ]
                }
            });
        }
    }
    
    const handleFieldDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => {
        // const m = Object.assign({}, value);
        // if (m.embed.fields && m.embed.fields.length) {
        //     m.embed.fields.splice(id, 1);
        //     if (!m.embed.fields.length) {
        //         delete m.embed.fields;
        //     }
        //     set(m);
        // }
        if (value.embed.fields && value.embed.fields.length) {
            set({
                ...value,
                embed: {
                    ...value.embed,
                    fields: [
                        ...value.embed.fields.filter((x, i) => i !== id),
                    ]
                }
            });
        }
    };

    return (
        <div>
            <button className={`sm-opener card-footer-button ${mc ? "sm-opener-blend" : ""}`} style={{ borderLeft: mc && value.embed.color ? `solid 10px ${chroma(value.embed.color).hex()}` : undefined}} onClick={handleShowClick}>{showing ? "Close Creator" : "Supermessage Creator"}</button>
            {showing ? (
                <div className={`sm-super ${mc}`} style={{ borderLeft: mc && value.embed.color ? `solid 10px ${chroma(value.embed.color).hex()}` : undefined }}>
                    <div className="sm-form-container">
                        {em && (
                            <div className="inline-error">
                                {em}
                            </div>
                        )}
                        {/* <br style={{ height: 5 }} /> */}
                        <textarea className="sm-txta"
                            rows={3}
                            placeholder="normal message content"
                            value={value.outside}
                            onChange={handleOutsideChange}
                        ></textarea>
                        <div className="sm-input-group">
                            <div className="sm-iholder" style={{ display: "flex", flexWrap: "nowrap" }}>
                                <span style={{ marginRight: 5 }}>Accent:</span>
                                <input type="color" name="smcolor" value={value.embed.color ?? 0x000000} onChange={handleColorAspectChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smicon" id="" placeholder="icon url" value={value.embed.authoricon ?? ""} onChange={handleIconChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smauth" id="" placeholder="author text" value={value.embed.authorname ?? ""} onChange={handleAuthorNameChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smauthurl" id="" placeholder="author url" value={value.embed.authorurl ?? ""} onChange={handleAuthorURLChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smthumb" id="" placeholder="thumbnail url" value={value.embed.thumbnailurl ?? ""} onChange={handleThumbChange} />
                            </div>
                        </div>
                        <div className="sm-input-group">
                            <div className="sm-iholder">
                                <input type="text" name="smthumb" id="" placeholder="thumbnail url" value={value.embed.thumbnailurl ?? ""} onChange={handleThumbChange} />
                            </div>
                        </div>
                        <div className="sm-input-group">
                            <div className="sm-iholder">
                                <input type="text" name="smtitle" id="" placeholder="title" value={value.embed.title ?? ""} onChange={handleTitleChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smurl" id="" placeholder="title url" value={value.embed.url ?? ""} onChange={handleURLChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smdesc" id="" placeholder="description" value={value.embed.description ?? ""} onChange={handleDescriptionChange} />
                            </div>
                        </div>
                        <div className="sm-input-group">
                            <div className="sm-iholder">
                                <input type="text" name="smimage" id="" placeholder="image url" value={value.embed.imageurl ?? ""} onChange={handleImageChange} />
                            </div>
                        </div>
                        <div>
                            <button onClick={handleFieldAdd} className="sm-add-field">Add Field</button>
                            {value.embed.fields?.length ? (
                                <span style={{opacity:0.5, marginLeft:7}}>{value.embed.fields.length} field{value.embed.fields.length > 1 ? "s" : ""} of 20</span>
                            ) : null}
                        </div>
                        <div className="sm-input-group">
                            <div className="sm-fields">
                                {value.embed.fields?.map((field, i) => (
                                    <div className="sm-field" key={`field-${i}`}>
                                        <div style={{ display: "flex", flexWrap: "nowrap" }}>
                                            <input className="sm-field-text" type="text" name={`smfieldname-${i}`} id="" placeholder="name" value={field.name} onChange={(e) => handleFieldNameChange(e, i)} />
                                            <button className="sm-field-option" style={{ color: "#c10030", fontSize: "1.1em" }} onClick={(e) => handleFieldDelete(e, i)}><FontAwesomeIcon icon={faWindowClose} /></button>
                                            <div className="sm-field-option">
                                                <label htmlFor={`smfieldinline-${i}`}>Inline</label>
                                                <input style={{marginLeft:6}} type="checkbox" name="smfieldinline" id={`smfieldinline-${i}`} checked={field.inline} onChange={(e) => handleFieldInlineChange(e, i)} />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "nowrap" }}>
                                            <input className="sm-field-text" type="text" name={`smfieldvalue-${i}`} id="" placeholder="text" value={field.value} onChange={(e) => handleFieldValueChange(e, i)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sm-input-group">
                            <div className="sm-iholder">
                                <input type="text" name="smfoot" id="" placeholder="footer text" value={value.embed.footertext ?? ""} onChange={handleFootChange} />
                            </div>
                            <div className="sm-iholder">
                                <input type="text" name="smfooticon" id="" placeholder="footer icon url" value={value.embed.footericon ?? ""} onChange={handleFootIconChange} />
                            </div>
                        </div>
                    </div>
                </div>

            ) : null}
        </div>
    )
}
