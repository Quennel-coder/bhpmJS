import { Box, Card, Stack } from "@mui/material";
import { H3, H4 } from "../../components/Typography";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BazarButton from "../../components/BazarButton";
import { updateBidItemHistoryDetail } from "../../redux/slice/bidItemHistorySlice";

export default function BidItemHistoriesRenderList({ bitItemHistories }) {
  const dispatch = useDispatch();
  const { username } = useSelector((state) => state.userAuth.user);
  const { cognitoGroup } = useSelector((state) => state.userAuth);
  const [loading, setLoading] = useState(false);

  const handleBidSuccess = async (history) => {
    setLoading(true);
    const updateBidItemHistoryDetailInput = {
      id: history.id,
      bidItemHistoryStatus: "Success",
    };
    console.log(updateBidItemHistoryDetailInput);
    const response = await dispatch(
      updateBidItemHistoryDetail(updateBidItemHistoryDetailInput)
    );
    //console.log(response.meta.requestStatus);
    if (response.meta.requestStatus === "fulfilled") {
      setLoading(false);
      alert("成功");
    } else {
      setLoading(false);
      alert("失敗");
    }
    setLoading(false);
  };
  //console.log(username);

  function differentStatus(history) {
    if (history.bidItemHistoryStatus === "Success") {
      return (
        <>
          <Card sx={{ minWidth: 275, backgroundColor: "#ba000d", p: "0.2rem" }}>
            <H4 sx={{ color: "white" }}>
              Lot {history.lots.lot} sold For CAD ${history.bidPrice} to
              Competing Bidder
            </H4>
            {/* <H3>
                ${history.bidPrice} ({history.bidForm})
              </H3>
              <H5 color="red">
                Lot {history.lots.lot} 
              </H5>
              <Typography variant="body1">
                {moment(history.createdAt).fromNow()}
              </Typography> */}
          </Card>
        </>
      );
    }
    if (history.bidItemHistoryStatus === "Start") {
      return (
        <>
          <Card sx={{ minWidth: 275, backgroundColor: "#388e3c", p: "0.2rem" }}>
            <H4 color="white">
              Lot {history.lots.lot} Opened - Ask ${history.lots.startingPrice}
            </H4>
            {/* <Typography variant="body1">
                {moment(history.createdAt).fromNow()}
              </Typography> */}
          </Card>
        </>
      );
    }
    if (history.bidItemHistoryStatus === "FirstCall") {
      return (
        <>
          <Card sx={{ minWidth: 275, backgroundColor: "#ffd686", p: "0.2rem" }}>
            <H3 sx={{ color: "blue" }}>First Warning</H3>
            {/* <H3>
                ${history.bidPrice} ({history.bidForm})
              </H3>
              <H2 color="blue">First Call</H2>
              <Typography variant="body1">
                {moment(history.createdAt).fromNow()}
              </Typography> */}
          </Card>
        </>
      );
    }
    if (history.bidItemHistoryStatus === "SecondCall") {
      return (
        <>
          <Card sx={{ minWidth: 275, backgroundColor: "#ffd686" }}>
            <H3 sx={{ color: "blue" }}>Second Warning</H3>
          </Card>
        </>
      );
    } else
      return (
        <>
          <Card sx={{ minWidth: 275, backgroundColor: "" }}>
            <H4>
              ${history.bidPrice} ({history.bidForm}): Competing Bid
            </H4>
          </Card>
        </>
      );
  }

  return (
    <div>
      <Stack
        spacing={2}
        sx={{
          margin: "auto",
          textAlign: "center",
        }}
      >
        {bitItemHistories &&
          bitItemHistories.map((history) => {
            return (
              <Box key={history.id}>
                {history.bidItemHistoryStatus ? (
                  <> {differentStatus(history)}</>
                ) : (
                  <Card sx={{ minWidth: 275, backgroundColor: "#c8c8c8" }}>
                    <H4 sx={{ color: "blue" }}>
                      ${history.bidPrice} ({history.bidForm}): Competing Bid
                    </H4>
                    {history.owner === username && "You"}

                    {cognitoGroup.includes("admin") && (
                      <BazarButton
                        color="primary"
                        variant="contained"
                        size="small"
                        disabled={loading}
                        onClick={() => {
                          handleBidSuccess(history);
                        }}
                      >
                        成功交易
                      </BazarButton>
                    )}
                  </Card>
                )}
              </Box>
            );
          })}
      </Stack>
    </div>
  );
}
