import React, { useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	Toaster,
	useToast,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	buttonVariants
} from "ui";
import { DotFilledIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { getSessions, logoutSession } from "@/api/sessions";
import { PageLayout } from "@/components/Layout";
import { Session } from "@/types/api";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { deleteSession } from "@/api/sessions";

export function Sessions() {
	const [sessions, setSessions] = useState<Session[] | null>(null);
	const [delSessionId, setDelSessionId] = useState<string | null>(null);
	const [disconnectSessionId, setDisconnectSessionId] = useState<string | null>(null);
	const { toast } = useToast();

	function fetchData() {
		getSessions().then((data) => {
			setSessions(data);
		});
	}

	useEffect(() => {
		fetchData();
	}, []);

	function deleteHandler() {
		if (delSessionId) {
			deleteSession(delSessionId).then((deleted: number) => {
				setDelSessionId(null);

				if (deleted > 0) {
					toast({
						title: "Deleted",
						description: "Session successfully deleted"
					});
					fetchData();
				} else {
					toast({
						title: "Something went wrong",
						description: "Could not remove the session. Please try again later."
					});
				}
			});
		}
	}

	function disconnectHandler() {
		if (disconnectSessionId) {
			logoutSession(disconnectSessionId).then((success: boolean) => {
				setDisconnectSessionId(null);

				if (success) {
					toast({
						title: "Disconnected",
						description: "Session successfully disconnected"
					});
					fetchData();
				} else {
					toast({
						title: "Something went wrong",
						description: "Could not disconnect the session. Please try again later."
					});
				}
			});
		}
	}

	return (
		<PageLayout>
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold md:text-2xl">Sessions</h1>
				<a
					href="/logs"
					className={`${buttonVariants({
						variant: "secondary"
					})} hover:text-inherit`}
				>
					Message logs
				</a>
			</div>

			<Table className="mt-8">
				<TableHeader>
					<TableRow>
						<TableHead>Session</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Last connected</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sessions &&
						sessions.map((session) => {
							return (
								<TableRow key={session._id}>
									<TableCell className="flex gap-x-2 font-medium">
										<img src={`./${session.browser}.svg`} className="w-5" />
										<div className="flex flex-col">
											<span className="capitalize">{session.browser}</span>
											<span className="text-gray-400">
												{session.os}, {session.arch}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-gray-400">
										<div className="flex">
											<DotFilledIcon
												className={clsx(
													"h-5 w-5",
													session.active ? "text-green-500" : "text-red-500"
												)}
											/>
											<span className="capitalize">{session.active ? "Active" : "Inactive"}</span>
										</div>
									</TableCell>
									<TableCell className="text-gray-400">
										{new Date(session.lastConnectedAt).toLocaleString()}
									</TableCell>
									<TableCell className="text-gray-400">
										{new Date(session.createdAt).toLocaleString()}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger>
												<DotsVerticalIcon />
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												{session.active && (
													<DropdownMenuItem onClick={(e) => setDisconnectSessionId(session._id)}>
														Disconnect
													</DropdownMenuItem>
												)}
												<DropdownMenuItem onClick={(e) => setDelSessionId(session._id)}>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
				</TableBody>
			</Table>

			<AlertDialog open={!!delSessionId}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete session</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the session and remove all
							associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={(e) => setDelSessionId(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={deleteHandler}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={!!disconnectSessionId}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disconnect session</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to disconnect this session? Please note that to reconnect, the
							session must be reactivated from the extension.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={(e) => setDisconnectSessionId(null)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={disconnectHandler}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Toaster />
		</PageLayout>
	);
}
