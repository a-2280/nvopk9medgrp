"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormProps {
  onClose?: () => void;
}

export default function ContactForm({ onClose }: ContactFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="bg-black/50 w-screen h-[100dvh] fixed top-0 left-0 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md bg-background rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <FieldSet>
              <div className="flex justify-between">
                <div>
                  <FieldLegend>Contact Us</FieldLegend>
                  <FieldDescription>
                    Get in touch with Nevada Operational K9 Medical Group
                  </FieldDescription>
                </div>
                <Button type="button" onClick={onClose}>
                  X
                </Button>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="contact-name">Full Name</FieldLabel>
                  <Input
                    id="contact-name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contact-email">Email Address</FieldLabel>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contact-phone">Phone Number</FieldLabel>
                  <Input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="contact-subject">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Training Inquiry</SelectItem>
                      <SelectItem value="equipment">
                        Medical Equipment
                      </SelectItem>
                      <SelectItem value="emergency">
                        Emergency Protocols
                      </SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="contact-message">Message</FieldLabel>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    className="resize-none min-h-[120px]"
                    required
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Send Message</Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
