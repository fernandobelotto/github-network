import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const UsernameSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

const FormSchema = z.object({
  usernames: z.array(UsernameSchema).min(1, "Add at least one username"),
});

type FormValues = z.infer<typeof FormSchema>;

interface GitHubUsersFormProps {
  onSubmit: (usernames: string[]) => void;
  isLoading: boolean;
}

export function GitHubUsersForm({ onSubmit, isLoading }: GitHubUsersFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      usernames: [{ username: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "usernames",
  });

  const handleSubmit = (data: FormValues) => {
    const usernames = data.usernames.map((item) => item.username);
    onSubmit(usernames);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name={`usernames.${index}.username`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>GitHub Username {index + 1}</FormLabel>
                    <FormControl>
                      <Input placeholder="octocat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                  className="mb-2"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ username: "" })}
          >
            Add Username
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Generate Network Graph"}
          </Button>
        </div>

        <FormDescription>
          Enter GitHub usernames to visualize their follower/following network.
          The graph will show connections between users.
        </FormDescription>
      </form>
    </Form>
  );
} 