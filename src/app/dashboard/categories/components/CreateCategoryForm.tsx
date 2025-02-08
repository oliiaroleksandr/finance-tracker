import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCategory } from "../actions/createCategory";
import {
  CreateCategorySchema,
  createCategorySchema,
} from "../validations/createCategorySchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateCategoryFormProps = {
  onCloseDialog: () => void;
};

const CreateCategoryForm = ({ onCloseDialog }: CreateCategoryFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: "expense",
    },
  });

  const { mutate: createCategoryMutation, isPending } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      onCloseDialog();
      toast.success("Category created successfully");
    },
    onError: () => {
      toast.error("Failed to create category");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", "list"] });
    },
  });

  function onSubmit(values: CreateCategorySchema) {
    createCategoryMutation(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateCategoryForm;
