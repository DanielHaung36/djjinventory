
import React from "react"
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Box,
  Paper,
  Avatar,
  Button,
  Divider
} from "@mui/material"
import AssignmentIcon from "@mui/icons-material/Assignment"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import FileTextIcon from "@mui/icons-material/Description"
import type { SalesOrder } from "../types/sales-order" // Assuming order data is imported from a file

interface QuoteInformationProps {
    order: SalesOrder
}

const QuoteInformation = ({order}: QuoteInformationProps) => {
  return (
            <Grid item xs={12} container spacing={3} alignItems="stretch" width="100%">
            <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  height: "100%",
                }}
              >
                <CardHeader
                  sx={{
                    background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                    color: "white",
                  }}
                  avatar={<AssignmentIcon sx={{ color: "white" }} />}
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      Quote Information
                    </Typography>
                  }
                />
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {[
                      { label: "Quote Number", value: order.quoteNumber },
                      { label: "Quote Date", value: order.quoteDate },
                      { label: "Created By", value: order.createdBy, hasAvatar: true },
                    ].map((item, index) => (
                      <Box key={index}>
                        <Typography variant="caption" color="text.secondary" fontWeight="600">
                          {item.label}
                        </Typography>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            mt: 1,
                            borderRadius: 2,
                            bgcolor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {item.hasAvatar ? (
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: "#8B5CF6" }}>
                                {item.value
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </Avatar>
                              <Typography variant="body1" fontWeight="500">
                                {item.value}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body1" fontWeight="500" fontFamily="monospace">
                              {item.value}
                            </Typography>
                          )}
                        </Paper>
                      </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        Quote Document
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<FileTextIcon />}
                        fullWidth
                        sx={{
                          mt: 1,
                          py: 1.5,
                          borderRadius: 2,
                          borderColor: "#8B5CF6",
                          color: "#8B5CF6",
                          "&:hover": {
                            borderColor: "#7C3AED",
                            bgcolor: "#faf5ff",
                          },
                        }}
                      >
                        View Quote PDF
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  height: "100%",

                }}
              >
                <CardHeader
                  sx={{
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "white",
                  }}
                  avatar={<TrendingUpIcon sx={{ color: "white" }} />}
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      Additional Information
                    </Typography>
                  }
                />
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        Quote Content
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mt: 1,
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography variant="body2">
                          {order.quoteContent || "Standard equipment package with extended warranty"}
                        </Typography>
                      </Paper>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600">
                        Payment Screenshot
                      </Typography>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mt: 1,
                          borderRadius: 2,
                          bgcolor: "#fef3c7",
                          border: "1px solid #fcd34d",
                        }}
                      >
                        <Typography variant="body2" color="#92400e">
                          Pending upload
                        </Typography>
                      </Paper>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        py: 2,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                        fontWeight: "bold",
                        "&:hover": {
                          background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                        },
                      }}
                    >
                      Update Information
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
  )
}

export default QuoteInformation