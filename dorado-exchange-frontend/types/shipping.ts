import { Address } from "./address";

// FEDEX LABEL
export type FedexLabelAddress = {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
};

export function formatFedexLabelAddress(address: Address) {
  return {
    streetLines: [address.line_1, address.line_2].filter(Boolean) as string[],
    city: address.city,
    stateOrProvinceCode: address.state,
    postalCode: address.zip,
    countryCode: address.country_code,
  };
}

export type FedexLabelInput = {
  order_id: string
  customerName: string
  customerPhone: string
  customerAddress: FedexLabelAddress
  shippingType: "Inbound" | "Outbound"
  pickupType: string
  packageDetails: {
    sequenceNumber: number
    weight: { units: "LB" | "KG"; value: number }
    dimensions: { length: number; width: number; height: number; units: "IN" | "CM" }
  }
  serviceType: string
}

export type FedexLabelResponse = {
  tracking_number: string
  label_url: string
}

// FEDEX RATES
export type FedexRatesAddress = {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential: boolean,
}

export function formatFedexRatesAddress(address: Address) {
  return {
    streetLines: [address.line_1, address.line_2].filter(Boolean) as string[],
    city: address.city,
    stateOrProvinceCode: address.state,
    postalCode: address.zip,
    countryCode: address.country_code,
    residential: address.is_residential,
  };
}

export type FedexRateInput = {
  shippingType: "Inbound" | "Outbound";
  customerAddress: FedexRatesAddress;
  packageDetails: {
    weight: { units: "LB" | "KG"; value: number };
    dimensions: { length: number; width: number; height: number; units: "IN" | "CM" };
  };
  pickupType: string;
};

export type FedexRate = {
  serviceType: string;
  packagingType: string;
  netCharge: number;
  currency: string;
  deliveryDay: string;
  transitTime: Date;
  serviceDescription: string;
};

// FEDEX PICKUP TIMES
export type FedexPickupTimesAddress = {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential: boolean,
}

export function formatFedexPickupTimesAddress(address: Address) {
  return {
    streetLines: [address.line_1, address.line_2].filter(Boolean) as string[],
    city: address.city,
    stateOrProvinceCode: address.state,
    postalCode: address.zip,
    countryCode: address.country_code,
    residential: address.is_residential,
  };
}

export type FedexPickupTimesInput = {
  customerAddress: FedexPickupTimesAddress;
  code: string,
};

export type FedexPickupTimes = {
  pickupDate: string;
  times: string[];
};

// FEDEX PICKUP
export type FedexPickupAddress = {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential: boolean,
}

export function formatFedexPickupAddress(address: Address) {
  return {
    streetLines: [address.line_1, address.line_2].filter(Boolean) as string[],
    city: address.city,
    stateOrProvinceCode: address.state,
    postalCode: address.zip,
    countryCode: address.country_code,
    residential: address.is_residential,
  };
}

export type FedexPickupInput = {
  // order_id: string,
  customerName: string,
  customerPhone: string,
  customerAddress: FedexPickupTimesAddress;
  pickupDate: string,
  pickupTime: string,
  code: string,
  // tracking_number: number,
};

export type FedexPickup = {
  confirmation: number,
};

export type FedexCancelPickupInput = {
  confirmationCode: number,
  pickupDate: string,
  code: string,
}

export type FedexLocationsInput = {
  customerAddress: FedexPickupTimesAddress,
  radiusMiles: number,
  maxResults: number,
}

export type FedexLocation = {
  locationId: string
  locationType: string
  distance: {
    value: number
    units: string
  }
  address: {
    streetLines: string[]
    city: string
    stateOrProvinceCode: string
    postalCode: string
    countryCode: string
  }
  contact: {
    companyName: string,
    phoneNumber: string,
  }
  operatingHours?: Record<string, string>
  latestExpressDropOffTime?: string
  geoPositionalCoordinates: {
    latitude: number
    longitude: number
  }
}

export type FedexLocationsReturn = {
  matchedAddressGeoCoord: {
    latitude: number
    longitude: number
  }
  locations: FedexLocation[]
}

export type FedexScanEventItem = {
  status: string,
  location: string,
  scan_time: Date,
}

export type ShipmentTracking = {
  id: string,
  tracking_number: string,
  shipping_status: string,
  estimated_delivery: Date,
  delivered_at: Date,
  scan_events: FedexScanEventItem[]
}


