/* @refresh reset */
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HealingIcon from '@mui/icons-material/Healing';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import fetchJSON from '../utils/fetchJSON';
import { fetchFormData } from '../utils/fetchFormData';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { usePermissions } from '../utils/usePermissions';

const API_BASE = 'https://apihealthconnect.kopanovertex.com';

const emptyIcd10 = () => ({
  id: null,
  ICD_10_code: '',
  MAF: '',
  price: '',
  showSecondaryIcd: false,
  secondaryICD_10_code: '',
  secondaryPrice: '',
  specializations: [],
  alignments: [],
});

const emptyMedicalAid = () => ({
  id: null,
  title: '',
  image: '',
});

const PACKAGE_PROVIDERS = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'social worker', label: 'Social worker' },
  { value: 'pharmacist', label: 'Pharmacist' },
];

function formatProviderLabel(provider) {
  if (!provider || typeof provider !== 'string') return '';
  const found = PACKAGE_PROVIDERS.find((p) => p.value === provider.toLowerCase());
  return found ? found.label : provider;
}

export default function Ailment() {
  const { canRead, canWrite, canDelete } = usePermissions();
  const [viewMode, setViewMode] = useState('ailments');
  const [ailments, setAilments] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [filteredAilments, setFilteredAilments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [packageCount, setPackageCount] = useState(0);
  const [icd10Codes, setIcd10Codes] = useState([]);
  const [filteredIcd10Codes, setFilteredIcd10Codes] = useState([]);
  const [icd10Count, setIcd10Count] = useState(0);
  const [medicalAids, setMedicalAids] = useState([]);
  const [filteredMedicalAids, setFilteredMedicalAids] = useState([]);
  const [medicalAidCount, setMedicalAidCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPackageQuery, setSearchPackageQuery] = useState('');
  const [searchIcd10Query, setSearchIcd10Query] = useState('');
  const [searchMedicalAidQuery, setSearchMedicalAidQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [isPackageEdit, setIsPackageEdit] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({
    id: null,
    provider: '',
    amount: '',
    consultations: '',
  });
  const [icd10DialogOpen, setIcd10DialogOpen] = useState(false);
  const [isIcd10Edit, setIsIcd10Edit] = useState(false);
  const [currentIcd10, setCurrentIcd10] = useState(emptyIcd10());
  const [medicalAidDialogOpen, setMedicalAidDialogOpen] = useState(false);
  const [isMedicalAidEdit, setIsMedicalAidEdit] = useState(false);
  const [currentMedicalAid, setCurrentMedicalAid] = useState(emptyMedicalAid());
  const [medicalAidImageFile, setMedicalAidImageFile] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentAilment, setCurrentAilment] = useState({
    id: null,
    title: '',
    description: '',
    teleconsultationCost: '',
    physicalconsultationCost: '',
    specialization: [],
    supportsTeleconsultation: false,
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchAilments();
    fetchSpecializations();
  }, []);

  useEffect(() => {
    let filtered = ailments;
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ailment) =>
          ailment.title?.toLowerCase().includes(lowercasedQuery) ||
          ailment.description?.toLowerCase().includes(lowercasedQuery)
      );
    }
    setFilteredAilments(filtered);
  }, [ailments, searchQuery]);

  useEffect(() => {
    let filtered = packages;
    if (searchPackageQuery) {
      const q = searchPackageQuery.toLowerCase();
      filtered = filtered.filter((pkg) => {
        const provider = pkg.providerLabel?.toLowerCase() ?? '';
        const raw = pkg.provider?.toLowerCase() ?? '';
        const amt = String(pkg.amount ?? '');
        const cons = String(pkg.consultations ?? '');
        return (
          provider.includes(q) ||
          raw.includes(q) ||
          amt.includes(q) ||
          cons.includes(q)
        );
      });
    }
    setFilteredPackages(filtered);
  }, [packages, searchPackageQuery]);

  useEffect(() => {
    let filtered = icd10Codes;
    if (searchIcd10Query) {
      const q = searchIcd10Query.toLowerCase();
      filtered = icd10Codes.filter((row) => {
        const code = row.ICD_10_code?.toLowerCase() ?? '';
        const secondaryCode = row.secondaryICD_10_code?.toLowerCase() ?? '';
        const maf = row.MAF?.toLowerCase() ?? '';
        const price = String(row.price ?? '');
        const secondaryPrice = String(row.secondaryPrice ?? '');
        const specs = row.specializationLabel?.toLowerCase() ?? '';
        const aligns = row.alignmentLabel?.toLowerCase() ?? '';
        return (
          code.includes(q) ||
          secondaryCode.includes(q) ||
          maf.includes(q) ||
          price.includes(q) ||
          secondaryPrice.includes(q) ||
          specs.includes(q) ||
          aligns.includes(q)
        );
      });
    }
    setFilteredIcd10Codes(filtered);
  }, [icd10Codes, searchIcd10Query]);

  useEffect(() => {
    let filtered = medicalAids;
    if (searchMedicalAidQuery) {
      const q = searchMedicalAidQuery.toLowerCase();
      filtered = medicalAids.filter((row) =>
        (row.title?.toLowerCase() ?? '').includes(q)
      );
    }
    setFilteredMedicalAids(filtered);
  }, [medicalAids, searchMedicalAidQuery]);

  useEffect(() => {
    if (viewMode === 'packages') {
      fetchPackages();
      fetchPackageCount();
    } else if (viewMode === 'icd10') {
      fetchIcd10Codes();
      fetchIcd10Count();
    } else if (viewMode === 'medicalAid') {
      fetchMedicalAids();
      fetchMedicalAidCount();
    }
  }, [viewMode]);

  const fetchAilments = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/portal/aligment/all-alignments",
        "GET"
      );
      if (response.ailments) {
        console.log('Raw API response:', response.ailments); // Debug: see what API returns
        const formatted = response.ailments.map((ailment) => {
          const teleconsultationCost =
            typeof ailment.teleconsultationCost === 'number'
              ? ailment.teleconsultationCost
              : (
                ailment.teleconsultationCost !== undefined &&
                ailment.teleconsultationCost !== null
                  ? parseFloat(ailment.teleconsultationCost)
                  : null
              );

          const physicalconsultationCost =
            typeof ailment.physicalconsultationCost === 'number'
              ? ailment.physicalconsultationCost
              : (
                ailment.physicalconsultationCost !== undefined &&
                ailment.physicalconsultationCost !== null
                  ? parseFloat(ailment.physicalconsultationCost)
                  : null
              );
          
          return {
            id: ailment._id,
            title: ailment.title || '',
            description: ailment.description || '',
            teleconsultationCost,
            physicalconsultationCost,
            supportsTeleconsultation: Boolean(ailment.supportsTeleconsultation),
            image: ailment.image || '',
            specialization: Array.isArray(ailment.specialization) 
              ? ailment.specialization.map(spec => spec?.title || spec || 'N/A').join(', ')
              : (ailment.specialization?.title || ailment.specialization || 'N/A'),
            specializationIds: Array.isArray(ailment.specialization)
              ? ailment.specialization.map(spec => typeof spec === 'object' ? spec._id : spec)
              : [typeof ailment.specialization === 'object' ? ailment.specialization._id : ailment.specialization].filter(Boolean),
          };
        });
        console.log('Formatted ailments:', formatted); // Debug log
        setAilments(formatted);
        setFilteredAilments(formatted);
      }
    } catch (error) {
      console.error("Error fetching ailments:", error);
      toast.error("Failed to load ailments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await fetchJSON(
        "https://apihealthconnect.kopanovertex.com/api/portal/specialization/all-specializations",
        "GET"
      );
      if (response.specializations) {
        setSpecializations(response.specializations);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const fetchPackageCount = async () => {
    try {
      const response = await fetchJSON(
        `${API_BASE}/api/portal/packages/count`,
        'GET'
      );
      // Backend: { status: "SUCCESS", count: number }
      setPackageCount(typeof response.count === 'number' ? response.count : 0);
    } catch (error) {
      console.error('Error fetching package count:', error);
      toast.error('Failed to load package count.');
    }
  };

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        `${API_BASE}/api/portal/packages/all`,
        "GET"
      );
      const raw = Array.isArray(response)
        ? response
        : response?.packages ?? response?.data ?? [];
      const formatted = raw.map((pkg) => {
        const providerRaw = pkg.provider ?? '';
        return {
          id: pkg._id || pkg.id,
          provider: typeof providerRaw === 'string' ? providerRaw : String(providerRaw ?? ''),
          providerLabel: formatProviderLabel(String(providerRaw ?? '')),
          amount:
            pkg.amount !== undefined && pkg.amount !== null ? pkg.amount : null,
          consultations:
            pkg.consultations !== undefined && pkg.consultations !== null
              ? pkg.consultations
              : null,
        };
      });
      setPackages(formatted);
      setFilteredPackages(formatted);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPackageDialog = (pkg = null) => {
    // Only treat as edit when given a package row (has id). Avoid mistaking click events for rows.
    if (pkg != null && pkg.id != null && pkg.id !== '') {
      setIsPackageEdit(true);
      setCurrentPackage({
        id: pkg.id,
        provider: typeof pkg.provider === 'string' ? pkg.provider : String(pkg.provider ?? ''),
        amount:
          pkg.amount !== null && pkg.amount !== undefined ? String(pkg.amount) : '',
        consultations:
          pkg.consultations !== null && pkg.consultations !== undefined
            ? String(pkg.consultations)
            : '',
      });
    } else {
      setIsPackageEdit(false);
      setCurrentPackage({
        id: null,
        provider: '',
        amount: '',
        consultations: '',
      });
    }
    setPackageDialogOpen(true);
  };

  const handleClosePackageDialog = () => {
    setPackageDialogOpen(false);
    setIsPackageEdit(false);
  };

  const handleSubmitPackage = async () => {
    if (!currentPackage.provider) {
      setSnackbarMessage('Please select a provider.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const amountNum = parseFloat(currentPackage.amount);
    if (
      currentPackage.amount === '' ||
      currentPackage.amount == null ||
      isNaN(amountNum) ||
      amountNum < 0
    ) {
      setSnackbarMessage('Amount is required and must be a valid non-negative number.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const consultationsNum = parseInt(String(currentPackage.consultations), 10);
    if (
      currentPackage.consultations === '' ||
      currentPackage.consultations == null ||
      !Number.isFinite(consultationsNum) ||
      consultationsNum < 1
    ) {
      setSnackbarMessage('Consultations is required and must be a whole number of at least 1.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const body = {
        provider: currentPackage.provider,
        amount: amountNum,
        consultations: consultationsNum,
      };
      if (isPackageEdit) {
        await fetchJSON(
          `${API_BASE}/api/portal/packages/update/${currentPackage.id}`,
          'PUT',
          body
        );
        setSnackbarMessage('Package updated successfully.');
      } else {
        await fetchJSON(
          `${API_BASE}/api/portal/packages/create`,
          'POST',
          body
        );
        setSnackbarMessage('Package created successfully.');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleClosePackageDialog();
      await fetchPackages();
      await fetchPackageCount();
    } catch (error) {
      setSnackbarMessage(
        error.message || (isPackageEdit ? 'Failed to update package.' : 'Failed to create package.')
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeletePackage = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this package?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await fetchJSON(
          `${API_BASE}/api/portal/packages/delete/${id}`,
          'DELETE'
        );
        setSnackbarMessage('Package deleted successfully.');
        setSnackbarSeverity('success');
        await fetchPackages();
        await fetchPackageCount();
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete package.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const fetchIcd10Count = async () => {
    try {
      const response = await fetchJSON(`${API_BASE}/api/portal/icd10/count`, 'GET');
      setIcd10Count(typeof response.count === 'number' ? response.count : 0);
    } catch (error) {
      console.error('Error fetching ICD-10 count:', error);
      toast.error('Failed to load ICD-10 count.');
    }
  };

  const fetchIcd10Codes = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(`${API_BASE}/api/portal/icd10/all`, 'GET');
      const raw = Array.isArray(response)
        ? response
        : response?.data ?? response?.icd10 ?? [];
      const formatted = raw.map((item) => {
        const specs = Array.isArray(item.specializations) ? item.specializations : [];
        const aligns = Array.isArray(item.alignments) ? item.alignments : [];
        return {
          id: item._id || item.id,
          ICD_10_code: item.ICD_10_code || '',
          MAF: item.MAF || '',
          price:
            item.price !== undefined && item.price !== null ? item.price : null,
          secondaryICD_10_code: item.secondaryICD_10_code || '',
          secondaryPrice:
            item.secondaryPrice !== undefined && item.secondaryPrice !== null
              ? item.secondaryPrice
              : null,
          specializationLabel: specs
            .map((s) => (typeof s === 'object' ? s.title : s))
            .filter(Boolean)
            .join(', '),
          alignmentLabel: aligns
            .map((a) => (typeof a === 'object' ? a.title : a))
            .filter(Boolean)
            .join(', '),
          specializationIds: specs
            .map((s) => (typeof s === 'object' ? s._id : s))
            .filter(Boolean)
            .map(String),
          alignmentIds: aligns
            .map((a) => (typeof a === 'object' ? a._id : a))
            .filter(Boolean)
            .map(String),
        };
      });
      setIcd10Codes(formatted);
      setFilteredIcd10Codes(formatted);
    } catch (error) {
      console.error('Error fetching ICD-10 codes:', error);
      toast.error('Failed to load ICD-10 codes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenIcd10Dialog = (row = null) => {
    if (row != null && row.id != null && row.id !== '') {
      setIsIcd10Edit(true);
      const hasSecondary = Boolean(
        (row.secondaryICD_10_code && String(row.secondaryICD_10_code).trim()) ||
          (row.secondaryPrice !== null &&
            row.secondaryPrice !== undefined &&
            row.secondaryPrice !== '')
      );
      setCurrentIcd10({
        id: row.id,
        ICD_10_code: row.ICD_10_code || '',
        MAF: row.MAF || '',
        price:
          row.price !== null && row.price !== undefined ? String(row.price) : '',
        showSecondaryIcd: hasSecondary,
        secondaryICD_10_code: row.secondaryICD_10_code || '',
        secondaryPrice:
          row.secondaryPrice !== null && row.secondaryPrice !== undefined
            ? String(row.secondaryPrice)
            : '',
        specializations: Array.isArray(row.specializationIds)
          ? row.specializationIds
          : [],
        alignments: Array.isArray(row.alignmentIds) ? row.alignmentIds : [],
      });
    } else {
      setIsIcd10Edit(false);
      setCurrentIcd10(emptyIcd10());
    }
    setIcd10DialogOpen(true);
  };

  const handleCloseIcd10Dialog = () => {
    setIcd10DialogOpen(false);
    setIsIcd10Edit(false);
    setCurrentIcd10(emptyIcd10());
  };

  const handleSubmitIcd10 = async () => {
    if (!currentIcd10.ICD_10_code || !String(currentIcd10.ICD_10_code).trim()) {
      setSnackbarMessage('ICD-10 code is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (!currentIcd10.MAF || !String(currentIcd10.MAF).trim()) {
      setSnackbarMessage('MAF is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const priceNum = parseFloat(currentIcd10.price);
    if (
      currentIcd10.price === '' ||
      currentIcd10.price == null ||
      isNaN(priceNum) ||
      priceNum < 0
    ) {
      setSnackbarMessage('Price is required and must be a valid non-negative number.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const secondaryCode = currentIcd10.showSecondaryIcd
      ? String(currentIcd10.secondaryICD_10_code || '').trim()
      : '';
    const secondaryPriceRaw = currentIcd10.showSecondaryIcd
      ? currentIcd10.secondaryPrice
      : '';
    const hasSecondaryCode = Boolean(secondaryCode);
    const hasSecondaryPrice =
      secondaryPriceRaw !== '' &&
      secondaryPriceRaw !== null &&
      secondaryPriceRaw !== undefined;
    let secondaryPriceNum = null;

    if (currentIcd10.showSecondaryIcd) {
      if (hasSecondaryCode !== hasSecondaryPrice) {
        setSnackbarMessage(
          'Second ICD-10 code and second price must both be provided, or remove the second code section.'
        );
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (hasSecondaryCode && hasSecondaryPrice) {
        secondaryPriceNum = parseFloat(secondaryPriceRaw);
        if (isNaN(secondaryPriceNum) || secondaryPriceNum < 0) {
          setSnackbarMessage(
            'Second price must be a valid non-negative number.'
          );
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
        if (
          secondaryCode.toUpperCase() ===
          String(currentIcd10.ICD_10_code).trim().toUpperCase()
        ) {
          setSnackbarMessage(
            'Second ICD-10 code must be different from the primary ICD-10 code.'
          );
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }
      }
    }

    if (
      !Array.isArray(currentIcd10.specializations) ||
      currentIcd10.specializations.length === 0
    ) {
      setSnackbarMessage('Please select at least one specialization.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    if (
      !Array.isArray(currentIcd10.alignments) ||
      currentIcd10.alignments.length === 0
    ) {
      setSnackbarMessage('Please select at least one alignment (ailment).');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const body = {
        ICD_10_code: String(currentIcd10.ICD_10_code).trim(),
        MAF: String(currentIcd10.MAF).trim(),
        price: priceNum,
        secondaryICD_10_code: hasSecondaryCode ? secondaryCode : '',
        secondaryPrice: hasSecondaryCode ? secondaryPriceNum : '',
        specializations: currentIcd10.specializations,
        alignments: currentIcd10.alignments,
      };
      if (isIcd10Edit) {
        await fetchJSON(
          `${API_BASE}/api/portal/icd10/update/${currentIcd10.id}`,
          'PUT',
          body
        );
        setSnackbarMessage('ICD-10 code updated successfully.');
      } else {
        await fetchJSON(`${API_BASE}/api/portal/icd10/create`, 'POST', body);
        setSnackbarMessage('ICD-10 code created successfully.');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseIcd10Dialog();
      await fetchIcd10Codes();
      await fetchIcd10Count();
    } catch (error) {
      setSnackbarMessage(
        error.message ||
          (isIcd10Edit
            ? 'Failed to update ICD-10 code.'
            : 'Failed to create ICD-10 code.')
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteIcd10 = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this ICD-10 code?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await fetchJSON(`${API_BASE}/api/portal/icd10/delete/${id}`, 'DELETE');
        setSnackbarMessage('ICD-10 code deleted successfully.');
        setSnackbarSeverity('success');
        await fetchIcd10Codes();
        await fetchIcd10Count();
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete ICD-10 code.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const fetchMedicalAidCount = async () => {
    try {
      const response = await fetchJSON(
        `${API_BASE}/api/portal/medical-aid/count`,
        'GET'
      );
      setMedicalAidCount(typeof response.count === 'number' ? response.count : 0);
    } catch (error) {
      console.error('Error fetching medical aid count:', error);
      toast.error('Failed to load medical aid count.');
    }
  };

  const fetchMedicalAids = async () => {
    setIsLoading(true);
    try {
      const response = await fetchJSON(
        `${API_BASE}/api/portal/medical-aid/all`,
        'GET'
      );
      const raw = Array.isArray(response)
        ? response
        : response?.data ?? response?.medicalAids ?? [];
      const formatted = raw.map((item) => ({
        id: item._id || item.id,
        title: item.title || '',
        image: item.image || '',
      }));
      setMedicalAids(formatted);
      setFilteredMedicalAids(formatted);
    } catch (error) {
      console.error('Error fetching medical aids:', error);
      toast.error('Failed to load medical aids. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMedicalAidDialog = (row = null) => {
    if (row != null && row.id != null && row.id !== '') {
      setIsMedicalAidEdit(true);
      setCurrentMedicalAid({
        id: row.id,
        title: row.title || '',
        image: row.image || '',
      });
    } else {
      setIsMedicalAidEdit(false);
      setCurrentMedicalAid(emptyMedicalAid());
    }
    setMedicalAidImageFile(null);
    setMedicalAidDialogOpen(true);
  };

  const handleCloseMedicalAidDialog = () => {
    setMedicalAidDialogOpen(false);
    setIsMedicalAidEdit(false);
    setCurrentMedicalAid(emptyMedicalAid());
    setMedicalAidImageFile(null);
  };

  const uploadMedicalAidImage = async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetchFormData(
      `${API_BASE}/api/portal/medical-aid/upload-image/${id}`,
      'PATCH',
      formData
    );
    return response;
  };

  const handleSubmitMedicalAid = async () => {
    if (!currentMedicalAid.title || !String(currentMedicalAid.title).trim()) {
      setSnackbarMessage('Title is required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const body = { title: String(currentMedicalAid.title).trim() };
      if (isMedicalAidEdit) {
        await fetchJSON(
          `${API_BASE}/api/portal/medical-aid/update/${currentMedicalAid.id}`,
          'PUT',
          body
        );
        if (medicalAidImageFile) {
          await uploadMedicalAidImage(currentMedicalAid.id, medicalAidImageFile);
        }
        setSnackbarMessage('Medical aid updated successfully.');
      } else {
        const created = await fetchJSON(
          `${API_BASE}/api/portal/medical-aid/create`,
          'POST',
          body
        );
        const createdId = created?.data?._id || created?.data?.id;
        if (medicalAidImageFile && createdId) {
          await uploadMedicalAidImage(createdId, medicalAidImageFile);
        }
        setSnackbarMessage('Medical aid created successfully.');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleCloseMedicalAidDialog();
      await fetchMedicalAids();
      await fetchMedicalAidCount();
    } catch (error) {
      setSnackbarMessage(
        error.message ||
          (isMedicalAidEdit
            ? 'Failed to update medical aid.'
            : 'Failed to create medical aid.')
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdateMedicalAidImage = async () => {
    if (!medicalAidImageFile || !currentMedicalAid.id) {
      setSnackbarMessage('Please select an image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await uploadMedicalAidImage(
        currentMedicalAid.id,
        medicalAidImageFile
      );
      const updatedImage = response?.data?.image || '';
      setCurrentMedicalAid((prev) => ({ ...prev, image: updatedImage }));
      setMedicalAidImageFile(null);
      setSnackbarMessage(response?.message || 'Medical aid image updated successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await fetchMedicalAids();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update medical aid image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteMedicalAidImage = async () => {
    if (!currentMedicalAid.id) return;

    const result = await Swal.fire({
      title: 'Delete image?',
      text: 'This will remove the medical aid image.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await fetchJSON(
        `${API_BASE}/api/portal/medical-aid/delete-image/${currentMedicalAid.id}`,
        'DELETE'
      );
      setCurrentMedicalAid((prev) => ({ ...prev, image: '' }));
      setMedicalAidImageFile(null);
      setSnackbarMessage('Medical aid image deleted successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      await fetchMedicalAids();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to delete medical aid image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteMedicalAid = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this medical aid?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await fetchJSON(
          `${API_BASE}/api/portal/medical-aid/delete/${id}`,
          'DELETE'
        );
        setSnackbarMessage('Medical aid deleted successfully.');
        setSnackbarSeverity('success');
        await fetchMedicalAids();
        await fetchMedicalAidCount();
        setSnackbarOpen(true);
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete medical aid.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleOpenDialog = (ailment = null) => {
    if (ailment) {
      setIsEdit(true);
      setCurrentAilment({
        id: ailment.id,
        title: ailment.title,
        description: ailment.description,
        teleconsultationCost:
          ailment.teleconsultationCost !== null && ailment.teleconsultationCost !== undefined
            ? ailment.teleconsultationCost
            : '',
        physicalconsultationCost:
          ailment.physicalconsultationCost !== null && ailment.physicalconsultationCost !== undefined
            ? ailment.physicalconsultationCost
            : '',
        specialization: Array.isArray(ailment.specializationIds) ? ailment.specializationIds : [],
        supportsTeleconsultation: Boolean(ailment.supportsTeleconsultation),
        image: ailment.image || '',
      });
      setImageFile(null);
    } else {
      setIsEdit(false);
      setCurrentAilment({
        id: null,
        title: '',
        description: '',
        teleconsultationCost: '',
        physicalconsultationCost: '',
        specialization: [],
        supportsTeleconsultation: false,
        image: '',
      });
      setImageFile(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (
      !currentAilment.title ||
      !currentAilment.description ||
      !currentAilment.specialization ||
      currentAilment.specialization.length === 0
    ) {
      setSnackbarMessage(
        'Please fill out all required fields and select at least one specialization.'
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    const physicalCost = parseFloat(currentAilment.physicalconsultationCost);
    if (isNaN(physicalCost) || physicalCost < 0.01) {
      setSnackbarMessage('Physical consultation cost is required and must be at least 0.01.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const teleCostRaw = currentAilment.teleconsultationCost;
    const hasTeleCost = teleCostRaw !== '' && teleCostRaw !== null && teleCostRaw !== undefined;
    const teleCost = hasTeleCost ? parseFloat(teleCostRaw) : null;

    if (hasTeleCost && (isNaN(teleCost) || teleCost < 0)) {
      setSnackbarMessage('Teleconsultation cost must be a valid positive value.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (currentAilment.supportsTeleconsultation && (teleCost === null || isNaN(teleCost) || teleCost < 0.01)) {
      setSnackbarMessage('Teleconsultation cost is required when teleconsultation is enabled.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      if (isEdit) {
        const response = await fetchJSON(
          `https://apihealthconnect.kopanovertex.com/api/portal/aligment/update-alignment/${currentAilment.id}`,
          "PUT",
          {
            title: currentAilment.title,
            description: currentAilment.description,
            teleconsultationCost: hasTeleCost ? teleCost : null,
            physicalconsultationCost: physicalCost,
            specialization: currentAilment.specialization,
            supportsTeleconsultation: Boolean(currentAilment.supportsTeleconsultation),
          }
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
        }
      } else {
        if (!imageFile) {
          setSnackbarMessage('Please upload an image for the ailment.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }

        const formData = new FormData();
        formData.append('title', currentAilment.title);
        formData.append('description', currentAilment.description);
        formData.append(
          'teleconsultationCost',
          hasTeleCost ? String(teleCost) : ''
        );
        formData.append(
          'physicalconsultationCost',
          String(physicalCost)
        );
        formData.append('specialization', JSON.stringify(currentAilment.specialization));
        formData.append('supportsTeleconsultation', String(Boolean(currentAilment.supportsTeleconsultation)));
        formData.append('image', imageFile);

        const response = await fetchFormData(
          "https://apihealthconnect.kopanovertex.com/api/portal/aligment/create-alignment",
          "POST",
          formData
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
        }
      }
      setSnackbarOpen(true);
      handleCloseDialog();
      setImageFile(null);
    } catch (error) {
      setSnackbarMessage(error.message || 'An error occurred. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this ailment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetchJSON(
          `https://apihealthconnect.kopanovertex.com/api/portal/aligment/delete-alignment/${id}`,
          "DELETE"
        );
        if (response.message) {
          setSnackbarMessage(response.message);
          setSnackbarSeverity('success');
          fetchAilments();
          setSnackbarOpen(true);
        }
      } catch (error) {
        setSnackbarMessage(error.message || 'Failed to delete ailment.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleUpdateImage = async () => {
    if (!imageFile) {
      setSnackbarMessage('Please select an image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetchFormData(
        `https://apihealthconnect.kopanovertex.com/api/portal/aligment/update-ailment-image/${currentAilment.id}`,
        "PUT",
        formData
      );

      if (response.message) {
        setSnackbarMessage(response.message);
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Ailment image updated successfully.');
        setSnackbarSeverity('success');
      }

      setSnackbarOpen(true);
      setImageFile(null);
      fetchAilments();
    } catch (error) {
      setSnackbarMessage(error.message || 'Failed to update ailment image.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', width: 150 },
    { field: 'description', headerName: 'Description', width: 150 },
    {
      field: 'physicalconsultationCost',
      headerName: 'Physical Consultation Cost',
      width: 200,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return 'N$0.00';
        }
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) {
          return 'N$0.00';
        }
        return `N$${numValue.toFixed(2)}`;
      }
    },
    {
      field: 'teleconsultationCost',
      headerName: 'Teleconsultation Cost',
      width: 140,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return 'N$0.00';
        }
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) {
          return 'N$0.00';
        }
        return `N$${numValue.toFixed(2)}`;
      }
    },
    {
      field: 'supportsTeleconsultation',
      headerName: 'Teleconsultation',
      width: 130,
      renderCell: (params) => {
        const isEnabled = Boolean(params.value);
        return (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: isEnabled ? 'success.main' : 'error.main',
            }}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </Typography>
        );
      },
    },
    { field: 'specialization', headerName: 'Specializations', width: 190 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(params.row.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const packageColumns = [
    {
      field: 'providerLabel',
      headerName: 'Provider',
      minWidth: 280,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 260,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return '—';
        }
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(numValue)) {
          return '—';
        }
        return `N$${numValue.toFixed(2)}`;
      },
    },
    {
      field: 'consultations',
      headerName: 'Consultations',
      width: 140,
      renderCell: (params) => {
        const value = params.value;
        if (value === undefined || value === null || value === '') {
          return '—';
        }
        const n = typeof value === 'number' ? value : parseInt(String(value), 10);
        return Number.isFinite(n) ? String(n) : '—';
      },
    },
    {
      field: 'packageActions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenPackageDialog(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePackage(params.row.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const formatIcdPrice = (value) => {
    if (value === undefined || value === null || value === '') {
      return '—';
    }
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numValue)) {
      return '—';
    }
    return `N$${numValue.toFixed(2)}`;
  };

  const icd10Columns = [
    { field: 'ICD_10_code', headerName: 'ICD-10 Code', width: 130 },
    {
      field: 'secondaryICD_10_code',
      headerName: '2nd ICD-10',
      width: 130,
      renderCell: (params) => params.value || '—',
    },
    { field: 'MAF', headerName: 'MAF', width: 120 },
    {
      field: 'price',
      headerName: 'Price',
      width: 110,
      renderCell: (params) => formatIcdPrice(params.value),
    },
    {
      field: 'secondaryPrice',
      headerName: '2nd Price',
      width: 110,
      renderCell: (params) => formatIcdPrice(params.value),
    },
    {
      field: 'specializationLabel',
      headerName: 'Specializations',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'alignmentLabel',
      headerName: 'Alignments',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'icd10Actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenIcd10Dialog(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteIcd10(params.row.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const medicalAidColumns = [
    {
      field: 'image',
      headerName: 'Image',
      width: 100,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Box
            component="img"
            src={`${API_BASE}/images/${params.value}`}
            alt={params.row.title || 'Medical aid'}
            sx={{
              width: 40,
              height: 40,
              objectFit: 'cover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
    },
    { field: 'title', headerName: 'Title', flex: 1, minWidth: 280 },
    {
      field: 'medicalAidActions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canWrite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMedicalAidDialog(params.row);
              }}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMedicalAid(params.row.id);
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const pageMeta = {
    ailments: {
      title: 'Ailments',
      subtitle: 'Manage all medical ailments and conditions.',
      count: ailments.length,
      label: 'Total Ailments',
    },
    packages: {
      title: 'Packages',
      subtitle: 'Manage health packages.',
      count: packageCount,
      label: 'Total Packages',
    },
    icd10: {
      title: 'ICD-10 Codes (MAF)',
      subtitle:
        'Manage ICD-10 / MAF codes with price, optional second ICD-10 + price, specializations, and alignments. MAF is used on medical aid claims.',
      count: icd10Count,
      label: 'Total ICD-10 / MAF Codes',
    },
    medicalAid: {
      title: 'Medical Aid',
      subtitle: 'Manage medical aid providers and their logos.',
      count: medicalAidCount,
      label: 'Total Medical Aids',
    },
  };
  const pageTitle = pageMeta[viewMode]?.title ?? 'Ailments';
  const pageSubtitle = pageMeta[viewMode]?.subtitle ?? '';
  const statsCount = pageMeta[viewMode]?.count ?? 0;
  const statsLabel = pageMeta[viewMode]?.label ?? '';

  return (
    <Grid container spacing={4} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          {pageTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {pageSubtitle}
        </Typography>
        <Box
          sx={{
            width: '100%',
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'action.hover',
          }}
        >
          <Tabs
            value={viewMode}
            onChange={(e, v) => setViewMode(v)}
            variant="fullWidth"
            aria-label="Switch between ailments, packages, ICD-10 codes, and medical aid"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
            }}
          >
            <Tab label="Ailments" value="ailments" />
            <Tab label="Packages" value="packages" />
            <Tab label="ICD-10 / MAF" value="icd10" />
            <Tab label="Medical Aid" value="medicalAid" />
          </Tabs>
        </Box>
      </Grid>

      {/* Statistics Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card raised sx={{ height: '100%' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              {viewMode === 'ailments' ? (
                <HealingIcon color="primary" fontSize="large" />
              ) : viewMode === 'packages' ? (
                <Inventory2Icon color="primary" fontSize="large" />
              ) : viewMode === 'icd10' ? (
                <LocalHospitalIcon color="primary" fontSize="large" />
              ) : (
                <HealthAndSafetyIcon color="primary" fontSize="large" />
              )}
              <Box>
                <Typography variant="h4" component="div">
                  {statsCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {statsLabel}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            {viewMode === 'ailments' && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5">All Ailments</Typography>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                    >
                      Add New
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search ailments"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <IconButton sx={{ pr: 1, color: 'text.secondary' }}>
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredAilments}
                      columns={columns}
                      getRowId={(row) => row.id}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </Box>
              </>
            )}

            {viewMode === 'packages' && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5">All Packages</Typography>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenPackageDialog()}
                    >
                      Add Package
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search packages"
                    variant="outlined"
                    value={searchPackageQuery}
                    onChange={(e) => setSearchPackageQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <IconButton sx={{ pr: 1, color: 'text.secondary' }}>
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredPackages}
                      columns={packageColumns}
                      getRowId={(row) => row.id}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </Box>
              </>
            )}

            {viewMode === 'icd10' && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5">All ICD-10 / MAF Codes</Typography>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenIcd10Dialog()}
                    >
                      Add ICD-10 / MAF
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search ICD-10 / MAF codes"
                    variant="outlined"
                    value={searchIcd10Query}
                    onChange={(e) => setSearchIcd10Query(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <IconButton sx={{ pr: 1, color: 'text.secondary' }}>
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredIcd10Codes}
                      columns={icd10Columns}
                      getRowId={(row) => row.id}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </Box>
              </>
            )}

            {viewMode === 'medicalAid' && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h5">All Medical Aids</Typography>
                  {canWrite && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenMedicalAidDialog()}
                    >
                      Add Medical Aid
                    </Button>
                  )}
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Search medical aids"
                    variant="outlined"
                    value={searchMedicalAidQuery}
                    onChange={(e) => setSearchMedicalAidQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <IconButton sx={{ pr: 1, color: 'text.secondary' }}>
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>

                <Box sx={{ height: 600, width: '100%' }}>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataGrid
                      rows={filteredMedicalAids}
                      columns={medicalAidColumns}
                      getRowId={(row) => row.id}
                      pageSizeOptions={[25, 50, 100]}
                    />
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Ailment' : 'Add New Ailment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {isEdit && currentAilment.image && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Current Image
                </Typography>
                <Box
                  component="img"
                  src={`https://apihealthconnect.kopanovertex.com/ailments/${currentAilment.image}`}
                  alt={currentAilment.title}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={currentAilment.title}
              onChange={(e) => setCurrentAilment({ ...currentAilment, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={currentAilment.description}
              onChange={(e) => setCurrentAilment({ ...currentAilment, description: e.target.value })}
              required
            />
            <TextField
              label="Physical Consultation Cost"
              variant="outlined"
              fullWidth
              type="number"
              value={currentAilment.physicalconsultationCost}
              onChange={(e) =>
                setCurrentAilment({ ...currentAilment, physicalconsultationCost: e.target.value })
              }
              required
              inputProps={{ step: "0.01", min: "0.01" }}
              helperText="Required"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(currentAilment.supportsTeleconsultation)}
                  onChange={(e) =>
                    setCurrentAilment({
                      ...currentAilment,
                      supportsTeleconsultation: e.target.checked,
                    })
                  }
                />
              }
              label="Supports Teleconsultation"
            />
            <TextField
              label="Teleconsultation Cost"
              variant="outlined"
              fullWidth
              type="number"
              value={currentAilment.teleconsultationCost}
              onChange={(e) =>
                setCurrentAilment({ ...currentAilment, teleconsultationCost: e.target.value })
              }
              required={Boolean(currentAilment.supportsTeleconsultation)}
              inputProps={{ step: "0.01", min: "0" }}
              helperText={currentAilment.supportsTeleconsultation ? 'Required when teleconsultation is enabled' : 'Optional'}
            />
            {!isEdit && (
              <>
                <Button
                  variant="outlined"
                  component="label"
                >
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setSnackbarMessage('Only image files are allowed.');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                        e.target.value = null;
                        return;
                      }
                      setImageFile(file);
                    }}
                  />
                </Button>
                {imageFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected image: {imageFile.name}
                  </Typography>
                )}
              </>
            )}
            {isEdit && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Change Image
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button variant="outlined" component="label">
                    Choose New Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          setSnackbarMessage('Only image files are allowed.');
                          setSnackbarSeverity('error');
                          setSnackbarOpen(true);
                          e.target.value = null;
                          return;
                        }
                        setImageFile(file);
                      }}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateImage}
                    disabled={!imageFile}
                  >
                    Update Image
                  </Button>
                </Stack>
                {imageFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selected image: {imageFile.name}
                  </Typography>
                )}
              </Box>
            )}
            <FormControl fullWidth required component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>Specializations</FormLabel>
              <Box
                sx={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Grid container spacing={1}>
                  {specializations.map((spec) => (
                    <Grid item xs={12} sm={6} md={4} key={spec._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={Array.isArray(currentAilment.specialization) && currentAilment.specialization.includes(spec._id)}
                            onChange={(e) => {
                              const currentSpecs = Array.isArray(currentAilment.specialization) 
                                ? currentAilment.specialization 
                                : [];
                              const newSpecs = e.target.checked
                                ? [...currentSpecs, spec._id]
                                : currentSpecs.filter(id => id !== spec._id);
                              setCurrentAilment({ ...currentAilment, specialization: newSpecs });
                            }}
                            size="small"
                          />
                        }
                        label={spec.title}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={packageDialogOpen} onClose={handleClosePackageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isPackageEdit ? 'Edit Package' : 'Add Package'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="package-provider-label">Provider</InputLabel>
              <Select
                labelId="package-provider-label"
                label="Provider"
                value={currentPackage.provider}
                onChange={(e) =>
                  setCurrentPackage({ ...currentPackage, provider: e.target.value })
                }
              >
                {PACKAGE_PROVIDERS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              fullWidth
              type="number"
              required
              value={currentPackage.amount}
              onChange={(e) => setCurrentPackage({ ...currentPackage, amount: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
            />
            <TextField
              label="Consultations"
              fullWidth
              type="number"
              required
              value={currentPackage.consultations}
              onChange={(e) =>
                setCurrentPackage({ ...currentPackage, consultations: e.target.value })
              }
              inputProps={{ step: '1', min: '1' }}
              helperText="Number of consultations included in the package"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePackageDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitPackage}>
            {isPackageEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={icd10DialogOpen} onClose={handleCloseIcd10Dialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isIcd10Edit ? 'Edit ICD-10 Code' : 'Add ICD-10 Code'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="ICD-10 Code"
              fullWidth
              required
              value={currentIcd10.ICD_10_code}
              onChange={(e) =>
                setCurrentIcd10({ ...currentIcd10, ICD_10_code: e.target.value })
              }
              placeholder="e.g. J06.9"
            />
            <TextField
              label="MAF"
              fullWidth
              required
              value={currentIcd10.MAF}
              onChange={(e) =>
                setCurrentIcd10({ ...currentIcd10, MAF: e.target.value })
              }
              placeholder="e.g. MAF code"
              helperText="Used as MAF on medical aid claim statements"
            />
            <TextField
              label="Price"
              fullWidth
              type="number"
              required
              value={currentIcd10.price}
              onChange={(e) => setCurrentIcd10({ ...currentIcd10, price: e.target.value })}
              inputProps={{ step: '0.01', min: '0' }}
            />
            {!currentIcd10.showSecondaryIcd ? (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  setCurrentIcd10({
                    ...currentIcd10,
                    showSecondaryIcd: true,
                  })
                }
                sx={{ alignSelf: 'flex-start' }}
              >
                Add second ICD-10 Code
              </Button>
            ) : (
              <Stack
                spacing={2}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography variant="subtitle2">
                    Second ICD-10 Code
                  </Typography>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() =>
                      setCurrentIcd10({
                        ...currentIcd10,
                        showSecondaryIcd: false,
                        secondaryICD_10_code: '',
                        secondaryPrice: '',
                      })
                    }
                  >
                    Remove
                  </Button>
                </Box>
                <TextField
                  label="Second ICD-10 Code"
                  fullWidth
                  value={currentIcd10.secondaryICD_10_code}
                  onChange={(e) =>
                    setCurrentIcd10({
                      ...currentIcd10,
                      secondaryICD_10_code: e.target.value,
                    })
                  }
                  placeholder="e.g. J00"
                />
                <TextField
                  label="Second Price"
                  fullWidth
                  type="number"
                  value={currentIcd10.secondaryPrice}
                  onChange={(e) =>
                    setCurrentIcd10({
                      ...currentIcd10,
                      secondaryPrice: e.target.value,
                    })
                  }
                  inputProps={{ step: '0.01', min: '0' }}
                  helperText="Medical aid consultation cost will be primary price + second price"
                />
              </Stack>
            )}
            <FormControl fullWidth required component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Specializations
              </FormLabel>
              <Box
                sx={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Grid container spacing={1}>
                  {specializations.map((spec) => (
                    <Grid item xs={12} sm={6} key={spec._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              Array.isArray(currentIcd10.specializations) &&
                              currentIcd10.specializations
                                .map(String)
                                .includes(String(spec._id))
                            }
                            onChange={(e) => {
                              const specId = String(spec._id);
                              const currentSpecs = Array.isArray(
                                currentIcd10.specializations
                              )
                                ? currentIcd10.specializations.map(String)
                                : [];
                              const next = e.target.checked
                                ? [...currentSpecs, specId]
                                : currentSpecs.filter((id) => id !== specId);
                              setCurrentIcd10({
                                ...currentIcd10,
                                specializations: next,
                              });
                            }}
                            size="small"
                          />
                        }
                        label={spec.title}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </FormControl>
            <FormControl fullWidth required component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Alignments (Ailments)
              </FormLabel>
              <Box
                sx={{
                  maxHeight: 220,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Grid container spacing={1}>
                  {ailments.map((ailment) => (
                    <Grid item xs={12} sm={6} key={ailment.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={
                              Array.isArray(currentIcd10.alignments) &&
                              currentIcd10.alignments
                                .map(String)
                                .includes(String(ailment.id))
                            }
                            onChange={(e) => {
                              const alignmentId = String(ailment.id);
                              const currentAligns = Array.isArray(
                                currentIcd10.alignments
                              )
                                ? currentIcd10.alignments.map(String)
                                : [];
                              const next = e.target.checked
                                ? [...currentAligns, alignmentId]
                                : currentAligns.filter((id) => id !== alignmentId);
                              setCurrentIcd10({
                                ...currentIcd10,
                                alignments: next,
                              });
                            }}
                            size="small"
                          />
                        }
                        label={ailment.title}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIcd10Dialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitIcd10}>
            {isIcd10Edit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={medicalAidDialogOpen}
        onClose={handleCloseMedicalAidDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isMedicalAidEdit ? 'Edit Medical Aid' : 'Add Medical Aid'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {isMedicalAidEdit && currentMedicalAid.image && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Current Image
                </Typography>
                <Box
                  component="img"
                  src={`${API_BASE}/images/${currentMedicalAid.image}`}
                  alt={currentMedicalAid.title || 'Medical aid'}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 160,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            )}
            <TextField
              label="Title"
              fullWidth
              required
              value={currentMedicalAid.title}
              onChange={(e) =>
                setCurrentMedicalAid({
                  ...currentMedicalAid,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Nammed"
            />
            {!isMedicalAidEdit && (
              <>
                <Button variant="outlined" component="label">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        setSnackbarMessage('Only image files are allowed.');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                        e.target.value = null;
                        return;
                      }
                      setMedicalAidImageFile(file);
                    }}
                  />
                </Button>
                {medicalAidImageFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected image: {medicalAidImageFile.name}
                  </Typography>
                )}
              </>
            )}
            {isMedicalAidEdit && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Change Image
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" component="label">
                    Choose New Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          setSnackbarMessage('Only image files are allowed.');
                          setSnackbarSeverity('error');
                          setSnackbarOpen(true);
                          e.target.value = null;
                          return;
                        }
                        setMedicalAidImageFile(file);
                      }}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateMedicalAidImage}
                    disabled={!medicalAidImageFile}
                  >
                    Update Image
                  </Button>
                  {currentMedicalAid.image && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteMedicalAidImage}
                    >
                      Delete Image
                    </Button>
                  )}
                </Stack>
                {medicalAidImageFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selected image: {medicalAidImageFile.name}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMedicalAidDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitMedicalAid}>
            {isMedicalAidEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
