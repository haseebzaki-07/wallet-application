"use client";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textinput";
import axios from "axios";

const SUPPORTED_BANKS = [
  {
    name: "HDFC Bank",
    redirectUrl: "https://netbanking.hdfcbank.com",
  },
  {
    name: "Axis Bank",
    redirectUrl: "https://www.axisbank.com/",
  },
];

export const AddMoneyCard = () => {
  const [redirectUrl, setRedirectUrl] = useState(
    SUPPORTED_BANKS[0]?.redirectUrl
  );
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
  const [value, setValue] = useState(0);

  const handleAddMoney = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/createOnRamptxn",
        {
          provider,
          amount: value,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        window.location.href = redirectUrl || "";
      } else {
        console.error(
          "Failed to add money:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <Card title="Add Money">
      <div className="w-full">
        <TextInput
          label={"Amount"}
          placeholder={"Amount"}
          onChange={(val) => setValue(Number(val))}
        />
        <div className="py-4 text-left">Bank</div>
        <Select
          onSelect={(value) => {
            const bank = SUPPORTED_BANKS.find((x) => x.name === value);
            setRedirectUrl(bank?.redirectUrl || "");
            setProvider(bank?.name || "");
          }}
          options={SUPPORTED_BANKS.map((x) => ({
            key: x.name,
            value: x.name,
          }))}
        />
        <div className="flex justify-center pt-4">
          <Button onClick={handleAddMoney}>Add Money</Button>
        </div>
      </div>
    </Card>
  );
};
