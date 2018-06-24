import React from 'react';
import PropTypes from 'prop-types';
import getClassName from '../../helpers/getClassName';
import classnames from '../../lib/classnames';
import './SearchAndroid.css';
import HeaderButton from '../HeaderButton/HeaderButton';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';

const baseClassName = getClassName('Search');

export default class SearchAndroid extends React.Component {
  constructor (props) {
    super(props);

    let state = {};

    if (props.hasOwnProperty('value')) {
      this.isControlledOutside = true;
    } else {
      state.value = props.defaultValue || '';
    }

    this.state = state;
  }

  static propTypes = {
    className: PropTypes.string,
    defaultValue: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClose: PropTypes.func,
    placeholder: PropTypes.node,
    getRef: PropTypes.func
  };

  static defaultProps = {
    placeholder: 'Поиск'
  };

  onCancel = () => {
    if (!this.isControlledOutside) {
      this.setState({ value: '' });
    }
    if (this.props.onChange) {
      this.props.onChange('');
    }
    this.inputEl.focus();
  };

  onChange = (e) => {
    if (!this.isControlledOutside) {
      this.setState({ value: e.target.value });
    }
    if (this.props.onChange) {
      this.props.onChange(e.target.value, e);
    }
  };

  componentDidMount () {
    this.inputEl.focus();
  }

  get value () {
    return this.isControlledOutside ? this.props.value : this.state.value;
  }

  inputRef = (el) => {
    this.inputEl = el;
    this.props.getRef && this.props.getRef(el);
  };

  render () {
    const { getRef, value, defaultValue, onChange, onClose, ...inputProps } = this.props;

    const className = classnames(baseClassName, {
      'Search--focused': this.state.focused,
      'Search--has-value': !!this.value
    }, this.props.className);

    return (
      <div className={className}>
        <div className="Search__before">
          <HeaderButton onClick={onClose}>
            <Icon24Back/>
          </HeaderButton>
        </div>
        <div className="Search__control">
          <input
            className="Search__input"
            ref={this.inputRef}
            value={this.value}
            onChange={this.onChange}
            {...inputProps}
          />
        </div>
        <div className="Search__after">
          <HeaderButton onClick={this.onCancel}>
            <Icon24Cancel/>
          </HeaderButton>
        </div>
      </div>
    );
  }
}
