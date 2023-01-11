export default class FormValidator {
  constructor(formElement) {
    this._formElement = formElement;
    this._inactiveButtonClass = 'submit-button_disactive';
    this._inputUnvalidClass = 'input_unvalid';
    this._inputValidClass = 'input_valid';
    this._errorClass = 'input-error_visible';
    this._inputList = Array.from(this._formElement.querySelectorAll('.input'));
    this._buttonElement = document.querySelector('.submit-button');
  }

  _showInputError(inputElement) {
    inputElement.classList.remove(`${this._inputValidClass}`);
    inputElement.classList.add(`${this._inputUnvalidClass}`);
    this._errorElement = this._formElement.querySelector(`#${inputElement.id}-error`);
    this._errorElement.textContent = inputElement.validationMessage;
    this._errorElement.classList.add(`${this._errorClass}`);
    if (this._formElement.classList.contains('payment-form')) {
      inputElement.closest('.payment-form__inputs-container').classList.add('payment-form__inputs-container_unvalid');
    }
  }

  _hideInputError(inputElement) {
    inputElement.classList.remove(`${this._inputUnvalidClass}`);
    inputElement.classList.add(`${this._inputValidClass}`);    
    this._errorElement = this._formElement.querySelector(`#${inputElement.id}-error`);
    this._errorElement.textContent = "";
    this._errorElement.classList.remove(`${this._errorClass}`);
    if (this._formElement.classList.contains('payment-form')) {
      inputElement.closest('.payment-form__inputs-container').classList.remove('payment-form__inputs-container_unvalid');
    }
  }

  deactivateButton() {
    this._buttonElement.classList.add(`${this._inactiveButtonClass}`);
    this._buttonElement.setAttribute("disabled", "disabled");
  }

  activateButton() {
    this._buttonElement.classList.remove(`${this._inactiveButtonClass}`);
    this._buttonElement.removeAttribute("disabled", "disabled");
  }

  clearInputError() {
    this._inputList.forEach((inputElement) => {
      this._hideInputError(inputElement);
    });
  } 

  _checkInputValidity(inputElement) {
    if (!inputElement.validity.valid) {
      this._showInputError(inputElement);
    } else {
      this._hideInputError(inputElement);
    }
  }

  _hasInvalidInput() {
    return this._inputList.some((inputElement) => {
      return !inputElement.validity.valid;
    });
  }

  _toggleButtonState() {
    this._hasInvalidInput() ? this.deactivateButton() : this.activateButton();   
    
  }

  _setEventListenerToInput() {
    this._inputList.forEach((inputElement) => {
      inputElement.addEventListener("input", () => {
        this._checkInputValidity(inputElement);
        if(this._formElement.classList.contains('payment-form')) {
          this._toggleButtonState();
        }        
      });
    });
  }

  enableValidation() {
    this._setEventListenerToInput();
  }
}