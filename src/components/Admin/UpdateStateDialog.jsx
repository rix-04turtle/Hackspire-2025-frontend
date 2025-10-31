
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


const UpdateStateDialog = ({ state, onUpdate, children }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(state.name);

    const handleUpdate = async () => {

        const API = `${BASE_URL}/indian-states/update-name`
        const params = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stateId: state._id, name }),
        }

        try {
            const response = await fetch(API, params);

            if (!response.ok) {
                throw new Error('Failed to update state name');
            }

            onUpdate(state._id, name);
            setOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit State</DialogTitle>
                    <DialogDescription>
                        Make changes to the state name here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdate}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateStateDialog;
