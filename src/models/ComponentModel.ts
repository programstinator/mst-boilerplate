import {
  getParent,
  getRoot,
  IAnyModelType,
  Instance,
  types,
} from 'mobx-state-tree';
import { RootType, FunctionModel } from '../internal';

export type ValidationResult = {
  result: boolean;
  message: string;
};

export const validateRequired = (
  self: ComponentModelType
): ValidationResult => {
  const returnValue = {
    result: !!self.value,
    message: '',
  };
  returnValue.message = returnValue.result ? '' : 'validation:required';
  return returnValue;
};

export const ComponentModel: IAnyModelType = types
  .model({
    autoFocus: false,
    id: types.identifier,
    value: types.maybeNull(
      types.optional(
        types.union(
          types.string,
          types.integer,
          types.Date,
          types.boolean,
          types.frozen({})
        ),
        ''
      )
    ),
    validators: types.optional(types.map(FunctionModel), {}),
    validationMessages: types.optional(types.map(types.string), {}),
    currentMessage: '',
    isRequired: false,
    name: '',
  })
  .views((self) => {
    return {
      get validationMessagesArray(): string[] {
        return Array.from(self.validationMessages.values());
      },
      get validatorsArray(): any[] {
        return Array.from(self.validators.values());
      },
      get parentPage() {
        return getParent(self, 2);
      },
      get root() {
        return getRoot(self);
      },
    };
  })
  .actions((self) => {
    return {
      onFocus() {
        const root: RootType = getRoot(self);
        root.setFocusedComponent && root.setFocusedComponent(self);
      },
      afterCreate() {
        if (self.isRequired) {
          this.addValidator('isRequired', validateRequired);
        }
      },
      setValue(value: string | number | Date) {
        self.value = value;
        if (self.currentMessage) {
          this.runValidators();
        }
      },
      clearData() {
        self.value = null;
      },
      addValidator(name: string, validator: any) {
        self.validators.set(name, validator);
      },
      setCurrentMessage(currentMessage: string) {
        self.currentMessage = currentMessage;
      },
      runValidators() {
        for (const validator of self.validatorsArray) {
          const validationResult = validator(self);
          if (!validationResult.result) {
            self.currentMessage = validationResult.message;
            break;
          } else {
            self.currentMessage = '';
          }
        }
      },
    };
  })
  .named('ComponentModel');
export type ComponentModelType = Instance<typeof ComponentModel>;
