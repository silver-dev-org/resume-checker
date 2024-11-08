import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type State = { url?: string; formData?: FormData };
const FormContext = createContext<[State, Dispatch<SetStateAction<State>>]>([
  {},
  () => {},
]);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({});
  return (
    <FormContext.Provider value={[state, setState]}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormState() {
  const ctx = useContext(FormContext);

  if (!ctx) {
    throw new Error("useFormState must be used within a FormProvider");
  }

  return ctx;
}
