import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import React, { useRef, useState } from "react";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { green } from "@mui/material/colors";
import { makeStyles } from "@mui/styles";
import { signUp } from "../../redux/slice/authSlice";
import { useDispatch } from "react-redux";

const useStyles = makeStyles(() => ({
  alert: {
    marginTop: "1.5rem",
  },
}));

export default function SignUp() {
  const classes = useStyles();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(false);
  const [alertContent, setAlertContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef();

  const {
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
      email: "",
      phone: "",
    },
  });

  //const { isAuthenticated } = useSelector((state) => state.userAuth);

  const handleClickShowPassword = () => {
    setIsShowPassword(!isShowPassword);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    const response = await dispatch(signUp(data));
    console.log("onSignUp", response);
    if (response.meta.requestStatus === "fulfilled") {
      navigate(`/auth/emailConfirm/${getValues("username")}`, {
        replace: true,
      });
    } else {
      timer.current = window.setTimeout(() => {
        setLoading(false);
        setAlertContent(response.error.message);
        setAlert(true);
        console.log(response.error.message);
      }, 1000);
      console.log(response.error.message);
    }
    setLoading(false);
  };

  const onForceSubmit = async (data) => {
    setLoading(true);
    const response = await dispatch(signUp(data));
    console.log("onSignUp", response);
    if (response.meta.requestStatus === "fulfilled") {
      navigate(`/auth/emailConfirm/${getValues("username")}`, {
        replace: true,
      });
    } else {
      timer.current = window.setTimeout(() => {
        setLoading(false);
        setOpen(false);
        setAlertContent(response.error.message);
        setAlert(true);
        console.log(response.error.message);
      }, 1000);
      console.log(response.error.message);
    }
  };

  // if (isAuthenticated) {
  //   return <Redirect to="/" />;
  // }

  const handleClose = () => {
    setOpen(false);
    setLoading(false);
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
        <Typography variant="h5">注册</Typography>
        <Typography>
          已经有账户了？
          <Link to="/auth/signIn">登入</Link>
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
            {/* <Grid item xs={12} sx={{ my: 1 }}>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: true,
                  minLength: 8,
                  maxLength: 20,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    required
                    label="用户名"
                    variant="outlined"
                    placeholder="注册后不能修改,为主要昵称,不要填写邮箱"
                    fullWidth
                    autoComplete="username"
                    onChange={onChange}
                    value={value}
                    error={!!errors.username}
                    helperText={errors.username ? "最短8符号,最长20符号" : null}
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12} sx={{ my: 1 }}>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: true,
                  pattern:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    required
                    label="邮箱"
                    variant="outlined"
                    placeholder=""
                    fullWidth
                    autoComplete="username"
                    onChange={onChange}
                    value={value}
                    error={!!errors.username}
                    helperText={errors.username ? "邮箱格式不对" : null}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sx={{ my: 1 }}>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    required
                    label="phone"
                    variant="outlined"
                    placeholder=""
                    fullWidth
                    autoComplete="phone"
                    onChange={onChange}
                    value={value}
                    error={!!errors.phone}
                    helperText={errors.phone ? "Required" : null}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sx={{ my: 1 }}>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      密码
                    </InputLabel>
                    <OutlinedInput
                      id="password"
                      type={isShowPassword ? "text" : "password"}
                      onChange={onChange}
                      error={!!errors.password}
                      value={value}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {isShowPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                    />
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            fullWidth
            color="primary"
            disabled={loading}
            sx={{ my: 4 }}
          >
            注册
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
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {`确认使用${getValues("email")} 来注册吗？`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                如果您有温莎大学
                xxx@uwindsor.ca的邮箱，无论您毕业与否，请先使用他，会有额外学生/校友福利哦！
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} autoFocus>
                取消
              </Button>
              <Button onClick={handleSubmit(onForceSubmit)}>注册</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Container>
  );
}
