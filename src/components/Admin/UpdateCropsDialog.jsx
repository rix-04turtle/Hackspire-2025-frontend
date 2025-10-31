
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const UpdateCropsDialog = ({ state, crops, onUpdate, children }) => {
    const [open, setOpen] = useState(false);
    const [selectedCrops, setSelectedCrops] = useState(state.crops || []);

    const handleUpdate = async () => {
        const API = `${BASE_URL}/indian-states/update-crops`
        const params = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stateId: state._id, cropIds: selectedCrops }),
        }

        try {
            const response = await fetch(API, params);

            if (!response.ok) {
                throw new Error('Failed to update crops');
            }

            onUpdate(state._id, selectedCrops);
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen} className="max-h-[85vh] overflow-y-auto">
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Crops for {state.name}</DialogTitle>
                    <DialogDescription>
                        Select the crops for this state. You can add or remove crops.
                    </DialogDescription>
                </DialogHeader>
                <Command>
                    <CommandInput placeholder="Search crops..." />
                    <CommandEmpty>No crops found.</CommandEmpty>
                    <CommandGroup className="max-h-[65vh] overflow-y-auto">
                        {Array.from(crops.entries()).map(([cropId, cropName]) => (
                            <CommandItem
                                key={cropId}
                                onSelect={() => {
                                    const newSelectedCrops = selectedCrops.includes(cropId)
                                        ? selectedCrops.filter((id) => id !== cropId)
                                        : [...selectedCrops, cropId];
                                    setSelectedCrops(newSelectedCrops);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCrops.includes(cropId) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {cropName}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
                <DialogFooter>
                    <Button onClick={handleUpdate}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateCropsDialog;
