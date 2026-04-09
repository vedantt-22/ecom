export interface Addressmodel {
  id:           number;
  label:        string;    // "Home", "Office", "Other"
  fullName:     string;
  phone:        string;
  addressLine1: string;
  addressLine2?: string;
  city:         string;
  state:        string;
  pincode:      string;
  isDefault:    boolean;
}

export interface CreateAddressRequestmodel {
  label:        string;
  fullName:     string;
  phone:        string;
  addressLine1: string;
  addressLine2?: string;
  city:         string;
  state:        string;
  pincode:      string;
  isDefault?:   boolean;
}