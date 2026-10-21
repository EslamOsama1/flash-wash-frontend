'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add Package
    const [showAddForm, setShowAddForm] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState('base');
    const [price, setPrice] = useState('');
    const [cost, setCost] = useState('');
    const [duration, setDuration] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    // Edit Package
    const [editingPackage, setEditingPackage] = useState(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState('base');
    const [editPrice, setEditPrice] = useState('');
    const [editCost, setEditCost] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editSaving, setEditSaving] = useState(false);

    // Action loading
    const [actionLoading, setActionLoading] = useState(null);

    // =========================
    // FETCH PACKAGES
    // =========================

    const fetchPackages = async () => {
        try {
            setLoading(true);
            setError('');

            const res = await api.get('/packages/admin');

            setPackages(res?.data?.packages || []);
        } catch (err) {
            console.error('GET PACKAGES ERROR:', err);
            setError(err?.message || 'Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // Create and clean up the selected image preview URL.
    useEffect(() => {
        if (!imageFile) {
            setImagePreviewUrl('');
            return;
        }

        const previewUrl = URL.createObjectURL(imageFile);
        setImagePreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [imageFile]);

    // =========================
    // ADD PACKAGE
    // =========================

    const handleAddPackage = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');

            const formData = new FormData();

            formData.append('name', name.trim());
            formData.append('type', type);
            formData.append('price', String(Number(price)));
            formData.append('cost', String(Number(cost)));
            formData.append('duration', String(Number(duration)));
            formData.append('description', description.trim());

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await api.post('/packages', formData);

            setName('');
            setType('base');
            setPrice('');
            setCost('');
            setDuration('');
            setDescription('');
            setImageFile(null);

            setShowAddForm(false);

            await fetchPackages();
        } catch (err) {
            console.error('ADD PACKAGE ERROR:', err);
            setError(err?.message || 'Failed to create package');
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // EDIT PACKAGE
    // =========================

    const handleOpenEdit = (pkg) => {
        setEditingPackage(pkg);

        setEditName(pkg.name || '');
        setEditType(pkg.type || 'base');
        setEditPrice(pkg.price ?? '');
        setEditCost(pkg.cost ?? '');
        setEditDuration(pkg.duration ?? '');
        setEditDescription(pkg.description || '');
    };

    const handleCloseEdit = () => {
        if (editSaving) return;

        setEditingPackage(null);
        setEditName('');
        setEditType('base');
        setEditPrice('');
        setEditCost('');
        setEditDuration('');
        setEditDescription('');
    };

    const handleEditPackage = async (e) => {
        e.preventDefault();

        if (!editingPackage) return;

        try {
            setEditSaving(true);
            setError('');

            await api.patch(`/packages/${editingPackage._id}`, {
                name: editName.trim(),
                type: editType,
                price: Number(editPrice),
                cost: Number(editCost),
                duration: Number(editDuration),
                description: editDescription.trim(),
            });

            handleCloseEdit();

            await fetchPackages();
        } catch (err) {
            console.error('EDIT PACKAGE ERROR:', err);
            setError(err?.message || 'Failed to update package');
        } finally {
            setEditSaving(false);
        }
    };

    // =========================
    // ACTIVATE / DEACTIVATE
    // =========================

    const handleToggleStatus = async (pkg) => {
        try {
            setActionLoading(pkg._id);
            setError('');

            await api.patch(`/packages/${pkg._id}`, {
                isActive: !pkg.isActive,
            });

            await fetchPackages();
        } catch (err) {
            console.error('TOGGLE PACKAGE ERROR:', err);
            setError(err?.message || 'Failed to update package status');
        } finally {
            setActionLoading(null);
        }
    };

    // =========================
    // DELETE
    // =========================

    const handleDeletePackage = async (pkg) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${pkg.name}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(pkg._id);
            setError('');

            await api.delete(`/packages/${pkg._id}`);

            await fetchPackages();
        } catch (err) {
            console.error('DELETE PACKAGE ERROR:', err);
            setError(err?.message || 'Failed to deactivate package');
        } finally {
            setActionLoading(null);
        }
    };

    // =========================
    // CLOSE ADD FORM
    // =========================

    const handleCloseAddForm = () => {
        if (saving) return;

        setShowAddForm(false);

        setName('');
        setType('base');
        setPrice('');
        setCost('');
        setDuration('');
        setDescription('');
        setImageFile(null);
    };

    const handleUploadPackageImage = async (pkg, file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image.');
            return;
        }

        try {
            setActionLoading(pkg._id);
            setError('');

            const formData = new FormData();
            formData.append('image', file);

            await api.patch(
                `/packages/${pkg._id}/image`,
                formData
            );

            await fetchPackages();
        } catch (err) {
            console.error('UPLOAD PACKAGE IMAGE ERROR:', err);
            setError(err?.message || 'Failed to upload package image');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePackageImage = async (pkg) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete the image for ${pkg.name}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(pkg._id);
            setError('');

            await api.delete(`/packages/${pkg._id}/image`);

            await fetchPackages();
        } catch (err) {
            console.error('DELETE PACKAGE IMAGE ERROR:', err);
            setError(err?.message || 'Failed to delete package image');
        } finally {
            setActionLoading(null);
        }
    };
    return (
        <div className="p-6 lg:p-8" >

            {/* =========================
                HEADER
            ========================= */}

            < div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" >

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Packages
                    </h1>

                    <p className="mt-1 text-slate-500" >
                        Manage your car wash packages and add - ons
                    </p >
                </div >

                <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
                >
                    + Add Package
                </button >

            </div >

            {/* =========================
                ERROR
            ========================= */}

            {
                error && (
                    <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-red-600" >
                        {error}
                    </div >
                )
            }

            {/* =========================
                ADD FORM
            ========================= */}

            {
                showAddForm && (
                    <div className="mb-8 rounded-xl bg-white p-6 shadow-sm" >

                        <div className="mb-6 flex items-center justify-between" >

                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Add Package
                                </h2>

                                <p className="mt-1 text-sm text-slate-500" >
                                    Create a base package or add - on
                                </p >
                            </div >

                            <button
                                type="button"
                                onClick={handleCloseAddForm}
                                disabled={saving}
                                className="text-xl text-slate-400 hover:text-slate-700"
                            >
                                ×
                            </button >

                        </div >

                        <form
                            onSubmit={handleAddPackage}
                            className="grid gap-5 md:grid-cols-2"
                        >

                            {/* Name */}
                            < div >
                                <label className="mb-2 block text-sm font-medium text-slate-700" >
                                    Package Name
                                </label >

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Premium Wash"
                                    required
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                />
                            </div >

                            {/* Type */}
                            < div >
                                <label className="mb-2 block text-sm font-medium text-slate-700" >
                                    Type
                                </label >

                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                >
                                    <option value="base">
                                        Base Package
                                    </option>

                                    <option value="add_on">
                                        Add-on
                                    </option>
                                </select >
                            </div >

                            {/* Price */}
                            < div >
                                <label className="mb-2 block text-sm font-medium text-slate-700" >
                                    Price
                                </label >

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 100"
                                    required
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                />
                            </div >

                            {/* Cost */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Cost
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    placeholder="e.g. 25"
                                    required
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                />
                            </div>

                            {/* Duration */}
                            < div >
                                <label className="mb-2 block text-sm font-medium text-slate-700" >
                                    Duration(minutes)
                                </label >

                                <input
                                    type="number"
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 30"
                                    required
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                />
                            </div >

                            {/* Description */}
                            < div className="md:col-span-2" >
                                <label className="mb-2 block text-sm font-medium text-slate-700" >
                                    Description
                                </label >

                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe this package..."
                                    rows={4}
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                />
                            </div >

                            {/* Package Image */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Package Image
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        setImageFile(e.target.files?.[0] || null);
                                    }}
                                    disabled={saving}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700"
                                />

                                {imageFile && (
                                    <div className="mt-3 flex items-center gap-4">
                                        <img src={imagePreviewUrl} alt="Package preview" className="h-24 w-24 rounded-lg border object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setImageFile(null)}
                                            disabled={saving}
                                            className="text-sm font-medium text-red-600 hover:text-red-800"
                                        >
                                            Remove selected image
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            < div className="flex items-end gap-3 md:col-span-2" >

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                >
                                    {saving ? 'Creating...' : 'Create Package'}
                                </button >

                                <button
                                    type="button"
                                    onClick={handleCloseAddForm}
                                    disabled={saving}
                                    className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button >

                            </div >

                        </form >

                    </div >
                )
            }

            {/* =========================
                LOADING
            ========================= */}

            {
                loading ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow-sm" >
                        <p className="text-slate-500" >
                            Loading packages...
                        </p >
                    </div >

                ) : packages.length === 0 ? (

                    <div className="rounded-xl bg-white p-8 text-center shadow-sm" >

                        <p className="text-slate-500" >
                            No packages found.
                        </p >

                        <button
                            type="button"
                            onClick={() => setShowAddForm(true)}
                            className="mt-4 text-sm font-medium text-slate-900 hover:underline"
                        >
                            Add your first package
                        </button >

                    </div >

                ) : (

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm" >

                        <div className="overflow-x-auto" >

                            <table className="w-full" >

                                <thead className="border-b bg-slate-50" >

                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            Image
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                            Name
                                        </th>

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" >
                                            Type
                                        </th >

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" >
                                            Price
                                        </th >

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" >
                                            Cost
                                        </th >

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" >
                                            Duration
                                        </th >

                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700" >
                                            Status
                                        </th >

                                        <th className="min-w-[420px] whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-700" >
                                            Actions
                                        </th >

                                    </tr >

                                </thead >

                                <tbody className="divide-y" >

                                    {
                                        packages.map((pkg) => (

                                            <tr
                                                key={pkg._id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    {pkg.image?.url ? (
                                                        <img
                                                            src={pkg.image.url}
                                                            alt={pkg.name}
                                                            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                                                            No image
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4" >

                                                    <div className="font-medium text-slate-900" >
                                                        {pkg.name}
                                                    </div >

                                                    {
                                                        pkg.description && (
                                                            <div className="mt-1 max-w-xs text-sm text-slate-500">
                                                                {pkg.description}
                                                            </div>
                                                        )
                                                    }

                                                </td >

                                                <td className="whitespace-nowrap px-6 py-4" >

                                                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700" >
                                                        {
                                                            pkg.type === 'base'
                                                                ? 'Base'
                                                                : 'Add-on'
                                                        }
                                                    </span >

                                                </td >

                                                <td className="px-6 py-4 text-slate-700" >
                                                    {pkg.price}
                                                </td >

                                                <td className="px-6 py-4 font-medium text-slate-700" >
                                                    {pkg.cost ?? 0}
                                                </td >

                                                <td className="px-6 py-4 text-slate-700" >
                                                    {pkg.duration} min
                                                </td >

                                                <td className="px-6 py-4" >

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-medium ${pkg.isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                    >
                                                        {pkg.isActive
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>

                                                </td >

                                                <td className="px-6 py-4 align-middle" >

                                                    <div className="flex min-w-[420px] flex-wrap items-center justify-end gap-x-4 gap-y-3" >

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenEdit(pkg)
                                                            }
                                                            className="whitespace-nowrap text-sm font-semibold text-blue-600 hover:text-blue-800"
                                                        >
                                                            Edit
                                                        </button >
                                                        <label
                                                            className={`whitespace-nowrap cursor-pointer text-sm font-semibold text-indigo-600 hover:text-indigo-800 ${actionLoading === pkg._id
                                                                ? 'pointer-events-none opacity-50'
                                                                : ''
                                                                }`}
                                                        >
                                                            {actionLoading === pkg._id
                                                                ? 'Processing...'
                                                                : pkg.image?.url
                                                                    ? 'Change Image'
                                                                    : 'Upload Image'}

                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                disabled={actionLoading === pkg._id}
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0];

                                                                    if (file) {
                                                                        handleUploadPackageImage(pkg, file);
                                                                    }

                                                                    e.target.value = '';
                                                                }}
                                                            />
                                                        </label>

                                                        {pkg.image?.url && (
                                                            <button
                                                                type="button"
                                                                disabled={actionLoading === pkg._id}
                                                                onClick={() => handleDeletePackageImage(pkg)}
                                                                className="whitespace-nowrap text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                                                            >
                                                                Delete Image
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                actionLoading ===
                                                                pkg._id
                                                            }
                                                            onClick={() =>
                                                                handleToggleStatus(pkg)
                                                            }
                                                            className="whitespace-nowrap text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
                                                        >
                                                            {actionLoading === pkg._id
                                                                ? '...'
                                                                : pkg.isActive
                                                                    ? 'Deactivate'
                                                                    : 'Activate'
                                                            }
                                                        </button >

                                                        {
                                                            pkg.isActive && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        actionLoading ===
                                                                        pkg._id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDeletePackage(
                                                                            pkg
                                                                        )
                                                                    }
                                                                    className="whitespace-nowrap text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                                                                >
                                                                    Delete
                                                                </button>
                                                            )
                                                        }

                                                    </div >

                                                </td >

                                            </tr >

                                        ))}

                                </tbody >

                            </table >

                        </div >

                    </div >

                )}

            {/* =========================
                EDIT MODAL
            ========================= */}

            {
                editingPackage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" >

                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" >

                            <div className="mb-6 flex items-center justify-between" >

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        Edit Package
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500" >
                                        Update package information
                                    </p >
                                </div >

                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    disabled={editSaving}
                                    className="text-xl text-slate-400 hover:text-slate-700"
                                >
                                    ×
                                </button >

                            </div >

                            <form
                                onSubmit={handleEditPackage}
                                className="space-y-5"
                            >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Package Name
                                    </label>

                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) =>
                                            setEditName(e.target.value)
                                        }
                                        required
                                        disabled={editSaving}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                    />
                                </div >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Type
                                    </label>

                                    <select
                                        value={editType}
                                        onChange={(e) =>
                                            setEditType(e.target.value)
                                        }
                                        disabled={editSaving}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-500"
                                    >
                                        <option value="base">
                                            Base Package
                                        </option>

                                        <option value="add_on">
                                            Add-on
                                        </option>
                                    </select >
                                </div >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editPrice}
                                        onChange={(e) =>
                                            setEditPrice(e.target.value)
                                        }
                                        required
                                        disabled={editSaving}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                    />
                                </div >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Cost
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editCost}
                                        onChange={(e) =>
                                            setEditCost(e.target.value)
                                        }
                                        required
                                        disabled={editSaving}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Duration (minutes)
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={editDuration}
                                        onChange={(e) =>
                                            setEditDuration(e.target.value)
                                        }
                                        required
                                        disabled={editSaving}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                    />
                                </div >

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Description
                                    </label>

                                    <textarea
                                        value={editDescription}
                                        onChange={(e) =>
                                            setEditDescription(e.target.value)
                                        }
                                        rows={4}
                                        disabled={editSaving}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-500"
                                    />
                                </div >

                                <div className="flex justify-end gap-3 pt-2" >

                                    <button
                                        type="button"
                                        onClick={handleCloseEdit}
                                        disabled={editSaving}
                                        className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button >

                                    <button
                                        type="submit"
                                        disabled={editSaving}
                                        className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        {
                                            editSaving
                                                ? 'Saving...'
                                                : 'Save Changes'
                                        }
                                    </button >

                                </div >

                            </form >

                        </div >

                    </div >
                )
            }

        </div >
    );
}