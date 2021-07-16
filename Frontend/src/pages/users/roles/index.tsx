import React from "react";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";

export interface Props {
  roles: string[];
  onRoleChange: React.Dispatch<string>;
  selectedRole: string;
}

const Roles: React.FC<Props> = ({ roles, onRoleChange, selectedRole }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRoleChange((event.target as HTMLInputElement).value);
  };
  return (
    <FormControl component="fieldset">
      <RadioGroup value={selectedRole} onChange={handleChange}>
        {roles.map((r) => (
          <FormControlLabel
            key={r}
            disabled
            value={r}
            control={<Radio />}
            label={r}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default Roles;
