"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StateSelect } from "./stateSelect";

import { Address, addressSchema } from "@/types/address";
import { useUpdateAddress } from "@/lib/queries/useAddresses";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";
import { Asterisk } from "lucide-react";

export default function AddressForm({ address, setOpen }:
  {
    address: Address;
    setOpen: (open: boolean) => void;
  }) {

  const { user } = useUserStore();
  const updateAddressMutation = useUpdateAddress(user?.id);

  const handleAddressSubmit = (values: Address) => {
    updateAddressMutation.mutate(values, {
      onSettled: () => {
        setOpen(false);
      }
    })
  };

  const addressForm = useForm<Address>({
    resolver: zodResolver(addressSchema),
    mode: 'onSubmit',
    defaultValues: address,
  });

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, ""); // Remove all non-numeric characters

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6, 10)}`;
  };

  // useEffect(() => {
  //   if (Object.keys(addressForm.formState.errors).length > 0) {
  //     console.log("Form validation errors:", addressForm.formState.errors);
  //   }
  // }, [addressForm.formState.errors]);

  return (
    <div>
      <Form {...addressForm}>
        <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
          <div className="mb-8">
            <FormField
              control={addressForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>

                  <FormLabel>
                    <div className="flex items-center">
                      <div className="mr-auto text-md text-gray-500 m-0 p-0">
                        Name
                      </div>
                      <Asterisk className="ml-auto w-3 h-3 text-red-500" />
                    </div>
                  </FormLabel>

                  <FormControl>
                    <Input placeholder="Business, Personal, etc..." className="placeholder:font-light font-normal" {...field} />
                  </FormControl>
                  {addressForm.formState.errors.name && (
                    <p className="text-red-500 text-sm">
                      {addressForm.formState.errors.name.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="mb-8">
            <FormField
              control={addressForm.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <div className="text-md text-gray-500 m-0 p-0">
                    <FormLabel>Phone Number</FormLabel>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="(123) 456 - 7890"
                      className="placeholder:font-light font-normal"
                      maxLength={16}
                      {...field} // Keep existing props
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  {addressForm.formState.errors.phone_number && (
                    <p className="text-red-500 text-sm">
                      {addressForm.formState.errors.phone_number.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="mb-8">
            <FormField
              control={addressForm.control}
              name="line_1"
              render={({ field }) => (
                <FormItem>
                  <div className="text-md text-gray-500 m-0 p-0">
                    <FormLabel>
                      <div className="flex items-center">
                        <div className="mr-auto text-md text-gray-500 m-0 p-0">
                          Address Line 1
                        </div>
                        <Asterisk className="ml-auto w-3 h-3 text-red-500" />
                      </div>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input placeholder="123 Gold Dr." className="placeholder:font-light font-normal" {...field} />
                  </FormControl>
                  {addressForm.formState.errors.line_1 && (
                    <p className="text-red-500 text-sm">
                      {addressForm.formState.errors.line_1.message}
                    </p>
                  )}
                </FormItem>
              )}
            />
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={addressForm.control}
                name="line_2"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-md text-gray-500 m-0 p-0">
                      <FormLabel>Address Line 2</FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="STE 201" className="placeholder:font-light font-normal" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={addressForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-md text-gray-500 m-0 p-0">
                      <FormLabel>
                        <div className="flex items-center">
                          <div className="mr-auto text-md text-gray-500 m-0 p-0">
                            City
                          </div>
                          <Asterisk className="ml-auto w-3 h-3 text-red-500" />
                        </div>
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="Dallas" className="placeholder:font-light font-normal" {...field} />
                    </FormControl>

                  </FormItem>
                )}
              />
            </div>
            <div className="flex">
              {addressForm.formState.errors.city && (
                <p className="ml-auto text-red-500 text-sm">
                  {addressForm.formState.errors.city.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={addressForm.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-md text-gray-500 m-0 p-0">
                      <FormLabel>
                        <div className="flex items-center">
                          <div className="mr-auto text-md text-gray-500 m-0 p-0">
                            Zip Code
                          </div>
                          <Asterisk className="ml-auto w-3 h-3 text-red-500" />
                        </div>
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input placeholder="12345" className="placeholder:font-light font-normal" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <StateSelect value={field.value} onChange={field.onChange} />
                  </FormItem>
                )}
              />
            </div>
            {addressForm.formState.errors.zip && (
              <p className="text-red-500 text-sm">
                {addressForm.formState.errors.zip.message}
              </p>
            )}
          </div>

          <div className="mb-8">
            <FormField
              control={addressForm.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <div className="text-md text-gray-500 m-0 p-0">
                    <FormLabel>
                      <div className="flex items-center">
                        <div className="mr-auto text-md text-gray-500 m-0 p-0">
                          Country
                        </div>
                        <Asterisk className="ml-auto w-3 h-3 text-red-500" />
                      </div>
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input readOnly placeholder="United States" className="placeholder:font-light font-normal" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full mb-8" disabled={updateAddressMutation.isPending}>
            {updateAddressMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
