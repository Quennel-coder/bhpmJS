import {
  Alert,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import React, { useRef, useState } from "react";

import { Box } from "@mui/system";
import { emailConfirm } from "../../redux/slice/authSlice";
import { green } from "@mui/material/colors";
import { makeStyles } from "@mui/styles";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));
export default function EmailConfirm() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [alert, setAlert] = useState(false);
  const [alertContent, setAlertContent] = useState("");
  const [loading, setLoading] = useState(); //logging state
  const navigate = useNavigate();
  const timer = useRef();

  const { username } = useParams();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: username,
      authenticationCode: "",
    },
  });
  const onSubmit = async (data) => {
    if (!loading) {
      // console.log("setLoading(loading)", loading);
      setLoading(true); //开始转圈
      const response = await dispatch(emailConfirm(data));
      if (response.meta.requestStatus === "fulfilled") {
        timer.current = window.setTimeout(() => {
          setLoading(false);
          console.log("response", response);
          navigate(`/auth/login`, {
            replace: true,
          });
        }, 1000);
      } else {
        timer.current = window.setTimeout(() => {
          setLoading(false);
          setAlertContent(response.error.message);
          setAlert(true);
        }, 1000);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">邮箱验证</Typography>
        <Typography variant="body1" sx={{ my: 1, color: "red" }}>
          请检查邮箱,有可能会在垃圾邮件里!
        </Typography>
        {alert ? (
          <Alert className={classes.alert} severity="error">
            {alertContent}
          </Alert>
        ) : (
          <></>
        )}
        <Box
          component="form"
          noValidate
          sx={{ my: 4 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sx={{ my: 1 }}>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    required
                    label="用户名"
                    variant="outlined"
                    fullWidth
                    autoComplete="username"
                    onChange={onChange}
                    value={value}
                    error={!!errors.username}
                    helperText={errors.username ? "不能为空" : null}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sx={{ my: 1 }}>
              <Controller
                name="authenticationCode"
                control={control}
                rules={{
                  required: true,
                  maxLength: 6,
                  minLength: 6,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    required
                    label="验证码"
                    variant="outlined"
                    fullWidth
                    onChange={onChange}
                    value={value}
                    error={!!errors.authenticationCode}
                    helperText={errors.authenticationCode ? "验证码不对" : null}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            color="primary"
            disabled={loading}
            sx={{ my: 4 }}
          >
            Confirm Sign Up
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  color: green[500],
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-0.75rem",
                  marginLeft: "-0.75rem",
                }}
              />
            )}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
