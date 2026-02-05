import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { patientService } from "@/services/patient-service";
import type { Patient } from "@/types/clinic";
import { useDebounce } from "@/hooks/useDebounce";

interface AsyncPatientSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function AsyncPatientSelect({
  value,
  onChange,
}: AsyncPatientSelectProps) {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const data = await patientService.getAll(debouncedSearch);
        setPatients(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [debouncedSearch]);

  useEffect(() => {
    if (value && !selectedLabel) {
      const found = patients.find((p) => p.id === value);
      if (found) setSelectedLabel(found.name);
    }
  }, [value, patients]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value
            ? patients.find((p) => p.id === value)?.name ||
              selectedLabel ||
              "Paciente selecionado"
            : "Selecione o paciente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          {" "}
          {}
          <CommandInput
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading && (
              <div className="p-4 text-sm text-center text-muted-foreground">
                Buscando...
              </div>
            )}

            {!loading && patients.length === 0 && (
              <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
            )}

            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : patient.id);
                    setSelectedLabel(patient.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === patient.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      CPF: {patient.cpf}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
