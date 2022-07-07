import { FormField, Group, Button } from "evergreen-ui";
import { FC } from "react";

type Props = {
  name: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const CustomSwitch: FC<Props> = ({ name, value, onChange }) => (
  <FormField label={name} flex={1}>
    <Group>
      <Button
        intent={value ? "success" : "none"}
        isActive={value}
        onClick={() => onChange(true)}
      >
        Enabled
      </Button>
      <Button
        intent={value ? "none" : "danger"}
        isActive={!value}
        onClick={() => onChange(false)}
      >
        Disabled
      </Button>
    </Group>
  </FormField>
);

export default CustomSwitch;
