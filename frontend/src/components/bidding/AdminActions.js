/*
 * @Author: Shen Shu
 * @Date: 2022-03-24 23:14:58
 * @LastEditors: Shen Shu
 * @LastEditTime: 2022-04-27 16:13:32
 * @FilePath: \bhpmJS\frontend\src\components\bidding\AdminActions.js
 * @Description:
 *
 * Copyright (c) 2022 by 用户/公司名, All Rights Reserved.
 */

import {
  Box,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  postBidHistory,
  selectMaxBidPriceByCurrentLot,
} from "../../redux/slice/bidHistorySlice";
import {
  selectLotByInProgress,
  selectLotByNextLotNumber,
  updateLotDetail,
} from "../../redux/slice/lotSlice";
import { useDispatch, useSelector } from "react-redux";

import BazarButton from "../BazarButton";
import { H1 } from "../Typography";
import { green } from "@mui/material/colors";

export default function AdminActions({ auctionId, nextBid }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [bidForm, setBidForm] = useState("Room");
  const [userNumber, setUserNumber] = useState(0);
  const [bidAmount, setBidAmount] = useState(0);
  //console.log(bidAmount);

  useEffect(() => {
    if (nextBid) {
      setBidAmount(nextBid);
    }
  }, [nextBid]);

  const lotInProgress = useSelector(selectLotByInProgress());
  const maxBidPriceByCurrentLot = useSelector(
    selectMaxBidPriceByCurrentLot({
      lotBidHistoriesId: lotInProgress[0]?.id,
    })
  );
  const handleSubmitBid = async (event) => {
    setLoading(true);
    const createBidHistoryInput = {
      id: lotInProgress.length === 1 && `${lotInProgress[0]?.id}-${bidAmount}`,
      bidPrice: bidAmount,
      auctionBidHistoriesId: auctionId,
      lotBidHistoriesId: lotInProgress.length === 1 && lotInProgress[0]?.id,
      bidForm: bidForm,
      userNumber: userNumber,
      owner: "admin",
    };
    const response = await dispatch(postBidHistory({ createBidHistoryInput }));
    if (response.meta.requestStatus === "fulfilled") {
      setLoading(false);
      setUserNumber(0);
      alert("bid成功");
    } else {
      setLoading(false);
      setUserNumber(0);
      // alert("bid失敗");
    }
  };

  const handleFirstSecondCall = async (event) => {
    setLoading(true);
    const createBidHistoryInput = {
      bidPrice: maxBidPriceByCurrentLot.bidPrice,
      auctionBidHistoriesId: auctionId,
      bidForm: "Room",
      lotBidHistoriesId: lotInProgress.length === 1 && lotInProgress[0]?.id,
      userNumber: 0,
      bidHistoryStatus: event.target.value,
      owner: "admin",
    };
    const response = await dispatch(postBidHistory({ createBidHistoryInput }));
    if (response.meta.requestStatus === "fulfilled") {
      setLoading(false);
      setUserNumber(0);
      alert(event.target.value, " 成功");
    } else {
      setLoading(false);
      setUserNumber(0);
      alert(event.target.value, " 失敗");
    }
  };

  const nextLotArr = useSelector(
    selectLotByNextLotNumber({
      lotOrder: lotInProgress[0] && lotInProgress[0].lotOrder + 1,
    })
  );
  //console.log(nextLotArr);
  const handleFinishAndNext = async (event) => {
    setLoading(true);
    const currentLot = lotInProgress[0];
    const nextLot = nextLotArr[0];
    const response1 = await dispatch(
      updateLotDetail({ id: currentLot.id, lotStatus: "Finished" })
    );
    console.log(response1);

    const response2 = await dispatch(
      updateLotDetail({ id: nextLot.id, lotStatus: "InProgress" })
    );
    console.log(response2);
    const createBidHistoryInput = {
      bidPrice: 0,
      auctionBidHistoriesId: auctionId,
      bidForm: "Room",
      lotBidHistoriesId: nextLot.id,
      userNumber: 0,
      bidHistoryStatus: "Start",
      owner: "admin",
    };
    const response3 = await dispatch(postBidHistory({ createBidHistoryInput }));
    console.log(response3);

    if (response3.meta.requestStatus === "fulfilled") {
      setLoading(false);
      setUserNumber(0);
      alert("成功");
    } else {
      setLoading(false);
      setUserNumber(0);
      alert("失敗");
    }
  };

  return (
    <Box sx={{ mx: "2rem" }}>
      <Box sx={{ my: "1rem" }}>
        <H1 color="primary">
          Bid Amount
          <FormControl sx={{ mx: 1 }}>
            <InputLabel htmlFor="outlined-adornment-amount">CAD</InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              value={bidAmount}
              onChange={(event) => setBidAmount(event.target.value)}
              startAdornment={
                <InputAdornment position="start">$</InputAdornment>
              }
              label="Amount"
            />
          </FormControl>
        </H1>
      </Box>
      <Box sx={{ display: "flex" }}>
        <Stack spacing={2} sx={{ width: "200px", mr: "2rem" }}>
          <FormControl fullWidth>
            <InputLabel htmlFor="outlined-adornment-amount">
              UserNumber
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-amount"
              value={userNumber}
              onChange={(event) => setUserNumber(event.target.value)}
              startAdornment={
                <InputAdornment position="start">#</InputAdornment>
              }
              label="Amount"
            />
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">BidForm</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={bidForm}
              label="Age"
              onChange={(event) => setBidForm(event.target.value)}
            >
              <MenuItem value={"Room"}>Room</MenuItem>
              <MenuItem value={"Internet"}>Internet</MenuItem>
              <MenuItem value={"Phone"}>Phone</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <BazarButton
          variant="contained"
          size="large"
          color="primary"
          disabled={loading}
          sx={{
            width: 200,
            // color: "blue",
          }}
          onClick={handleSubmitBid}
        >
          Bid{" "}
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
        </BazarButton>
      </Box>
      <Stack direction="row" spacing={2} sx={{ my: "1rem" }}>
        <BazarButton
          size="large"
          color="primary"
          variant="contained"
          value={"FirstCall"}
          onClick={handleFirstSecondCall}
          disabled={loading || !maxBidPriceByCurrentLot}
        >
          First Call{" "}
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
        </BazarButton>
        <BazarButton
          size="large"
          color="primary"
          variant="contained"
          value={"SecondCall"}
          onClick={handleFirstSecondCall}
          disabled={loading || !maxBidPriceByCurrentLot}
        >
          Second Call{" "}
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
        </BazarButton>{" "}
        <BazarButton
          size="large"
          color="primary"
          variant="contained"
          onClick={handleFinishAndNext}
          disabled={loading || !lotInProgress[0]}
        >
          Finish lot: {lotInProgress[0] && lotInProgress[0].lot} & Start Next
          (if exist)
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
        </BazarButton>
      </Stack>
    </Box>
  );
}
