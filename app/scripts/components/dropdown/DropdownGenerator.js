import React from 'react';
import PropTypes from 'prop-types';
import { Res } from 'containers/util/Res';

const options = [
    { id: 'upper', text: 'ABC' },
    { id: 'lower', text: 'abc' },
    { id: 'digits', text: '123' },
    { id: 'special', text: '!@#' },
    { id: 'brackets', text: '({>' },
    { id: 'high', text: 'äæ±' },
    { id: 'ambiguous', text: '0Oo' },
];

class DropdownGenerator extends React.Component {
    static propTypes = {
        locale: PropTypes.object.isRequired,
        opt: PropTypes.object.isRequired,
        presets: PropTypes.array.isRequired,
        preset: PropTypes.string,
        onOptionChange: PropTypes.func.isRequired,
        onPresetChange: PropTypes.func.isRequired,
        onLengthChange: PropTypes.func.isRequired,
    };
    onPresetChange = e => {
        const preset = e.target.value;
        this.props.onPresetChange({ preset });
    };
    onOptionChange = e => {
        const checked = e.target.checked;
        const option = e.target.dataset.id;
        this.props.onOptionChange({ option, checked });
    };
    onLengthChange = e => {
        const value = e.target.value;
        this.props.onLengthChange({ value });
    };
    render() {
        const { opt, locale, presets, preset } = this.props;
        return (
            <div className="gen">
                <div>
                    <Res id="genLen" />: <span className="gen__length-range-val">{opt.length}</span>
                    <i className="fa fa-refresh gen__btn-refresh" title={locale.genNewPass} />
                </div>
                <select
                    className="gen__sel-tpl input-base"
                    value={preset}
                    onChange={this.onPresetChange}
                >
                    {presets.map(preset => (
                        <option value={preset.name} key={preset.name}>
                            {preset.title}
                        </option>
                    ))}
                    <option value="...">...</option>
                </select>
                <input
                    type="range"
                    className="gen__length-range"
                    min="0"
                    max="25"
                    value={opt.pseudoLength}
                    onChange={this.onLengthChange}
                />
                <div>
                    {options.map(option => (
                        <div className="gen__check" key={option.id}>
                            <input
                                type="checkbox"
                                id={`gen__check-${option.id}`}
                                data-id={option.id}
                                checked={!!opt[option.id]}
                                onChange={this.onOptionChange}
                            />
                            <label htmlFor={`gen__check-${option.id}`}>{option.text}</label>
                        </div>
                    ))}
                </div>
                <div className="gen__result" />
                <div className="gen__btn-wrap">
                    <button className="gen__btn-ok">
                        <Res id="alertCopy" />
                    </button>
                </div>
            </div>
        );
    }
}

export { DropdownGenerator };