interface CheckoutStepperProps {
  step: number;
}

const STEPS = ['Traveller details', 'Protection', 'Billing & payment'] as const;

export const CheckoutStepper = ({ step }: CheckoutStepperProps): JSX.Element => {
  return (
    <ol className="checkout-steps">
      {STEPS.map((label, index) => (
        <li key={label} className={index === step ? 'is-active' : index < step ? 'is-done' : ''}>
          <span>{index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
};
