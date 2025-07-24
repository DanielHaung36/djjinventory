import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Alert,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, AttachFile, Delete, Close } from '@mui/icons-material';
import { useUploadOrderDocumentsMutation } from '../../salesApi';

interface OrderDocumentUploadDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  documentType: 'deposit_receipt' | 'final_payment_receipt' | 'pd_report' | 'shipping_doc' | 'delivery_confirmation';
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

interface UploadFile {
  file: File;
  id: string;
}

const DOCUMENT_TYPES = {
  deposit_receipt: {
    title: 'Upload Deposit Receipt',
    description: 'Upload proof of deposit payment (receipts, bank transfers, etc.)',
    actionLabel: 'Upload & Mark Deposit Received'
  },
  final_payment_receipt: {
    title: 'Upload Final Payment Receipt',
    description: 'Upload proof of final payment completion',
    actionLabel: 'Upload & Mark Payment Received'
  },
  pd_report: {
    title: 'Upload Inspection Documents',
    description: 'Upload pre-delivery inspection reports and quality documents',
    actionLabel: 'Upload & Complete Inspection'
  },
  shipping_doc: {
    title: 'Upload Shipping Documents',
    description: 'Upload shipping manifests, tracking numbers, and dispatch documents',
    actionLabel: 'Upload & Mark Shipped'
  },
  delivery_confirmation: {
    title: 'Upload Delivery Confirmation',
    description: 'Upload delivery receipts and customer acceptance documents',
    actionLabel: 'Upload & Mark Delivered'
  }
};

const OrderDocumentUploadDialog: React.FC<OrderDocumentUploadDialogProps> = ({
  open,
  onClose,
  orderId,
  documentType,
  onSuccess,
  title,
  description
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // RTK Query mutation
  const [uploadDocuments, { isLoading: uploading }] = useUploadOrderDocumentsMutation();

  const config = DOCUMENT_TYPES[documentType];
  const dialogTitle = title || config.title;
  const dialogDescription = description || config.description;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
      setSuccessMessage(null);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please upload at least one document.');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      files.forEach((uploadFile, index) => {
        formData.append(`files`, uploadFile.file);
      });
      formData.append('orderId', orderId.toString());
      formData.append('documentType', documentType);
      formData.append('notes', notes);

      // Upload documents using RTK Query
      const uploadResult = await uploadDocuments(formData).unwrap();

      // Show success message with upload details
      if (uploadResult && uploadResult.data) {
        const { uploadedCount, totalCount } = uploadResult.data;
        setSuccessMessage(`Successfully uploaded ${uploadedCount} of ${totalCount} files!`);
        
        // Show success for a moment before closing
        setTimeout(() => {
          onSuccess?.();
          onClose();
          
          // Reset form
          setFiles([]);
          setNotes('');
          setSuccessMessage(null);
        }, 1500);
      } else {
        onSuccess?.();
        onClose();
        
        // Reset form
        setFiles([]);
        setNotes('');
      }
      
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err?.data?.error || err?.message || 'Upload failed');
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFiles([]);
      setNotes('');
      setError(null);
      setSuccessMessage(null);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={uploading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {dialogTitle}
          </Typography>
          <IconButton onClick={handleClose} disabled={uploading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {dialogDescription}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* File Upload Area */}
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            or click to browse files
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Supported: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB each, up to 10 files)
          </Typography>
        </Box>

        {/* File List */}
        {files.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files ({files.length})
            </Typography>
            <List dense>
              {files.map((uploadFile) => (
                <ListItem key={uploadFile.id} divider>
                  <AttachFile sx={{ mr: 1, color: 'grey.600' }} />
                  <ListItemText
                    primary={uploadFile.file.name}
                    secondary={formatFileSize(uploadFile.file.size)}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Notes Field */}
        <TextField
          fullWidth
          label="Notes (Optional)"
          placeholder="Add any additional notes about this document upload..."
          multiline
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={uploading}
          sx={{ mb: 2 }}
        />

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading documents and processing workflow...
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={uploading || files.length === 0}
          startIcon={<CloudUpload />}
        >
          {uploading ? 'Processing...' : config.actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDocumentUploadDialog;