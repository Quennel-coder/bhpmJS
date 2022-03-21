import "react-image-gallery/styles/css/image-gallery.css";
import "./slideCSS.css";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { H1, H2, H3 } from "../../components/Typography";
import React, { useEffect, useRef, useState } from "react";
import {
  fetchBidItemHistories,
  insertBidItemHistory,
  postBidItemHistory,
  selectAllBidItemHistories,
  selectMaxBidPriceByCurrentLot,
} from "../../redux/slice/bidItemHistorySlice";
import {
  fetchLotss,
  selectLotByInProgress,
  updateLotsDetailBySub,
} from "../../redux/slice/lotsSlice";
import {
  onCreateBidItemHistory,
  onUpdateBidItemHistory,
} from "../../graphql_custom/_subscriptions";
import {
  selectAuctionsById,
  selectedAuctions,
} from "../../redux/slice/auctionsSlice";
import { useDispatch, useSelector } from "react-redux";

import { API } from "aws-amplify";
import AdminActions from "./AdminActions";
import AdminTable from "./AdminTable";
import BazarButton from "../../components/BazarButton";
import BidItemHistoriesRenderList from "./BidItemHistoriesRenderList";
import ImageGallery from "react-image-gallery";
import { green } from "@mui/material/colors";
import { makeStyles } from "@mui/styles";
import { onUpdateLots } from "../../graphql/subscriptions";
import { useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  glary: {
    width: "900px",
    [theme.breakpoints.down("900")]: {
      width: "100%",
    },
  },
}));
export default function BiddingTest() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { auctionsID } = useParams();
  const { isAuthenticated } = useSelector((state) => state.userAuth);
  const { cognitoGroup } = useSelector((state) => state.userAuth);
  //console.log(cognitoGroup);
  const bitItemHistories = useSelector(selectAllBidItemHistories);
  const { fetchBidItemHistoriesStatus } = useSelector(
    (state) => state.bidItemHistory
  );
  const messageRef = useRef();

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }, [bitItemHistories]);
  const [alertStatus, setAlertStatus] = useState({
    isOpen: false,
    isSuccess: null,
    sentence: null,
  });
  //console.log("alertStatus", alertStatus);
  const handleAlertClose = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertStatus({ ...alertStatus, isOpen: false });
  };
  //console.log(isAuthenticated);

  //const lotss = useSelector(selectAllLotss);
  const lotInProgress = useSelector(selectLotByInProgress());
  //console.log("lotInProgress", lotInProgress);

  const maxBidPriceByCurrentLot = useSelector(
    selectMaxBidPriceByCurrentLot({
      lotID: lotInProgress.length === 1 && lotInProgress[0].id,
    })
  );
  //console.log("maxBidPriceByCurrentLot", maxBidPriceByCurrentLot);
  useEffect(() => {
    if (isAuthenticated !== null && auctionsID) {
      dispatch(selectedAuctions({ isAuthenticated, auctionsID }));
      dispatch(fetchLotss({ isAuthenticated, auctionsID }));
    }
  }, [dispatch, isAuthenticated, auctionsID]);
  //console.log("lotss", lotss);
  const auction = useSelector((state) => selectAuctionsById(state, auctionsID));
  //console.log("auction", auction && auction.auctionUserLimitations.items[0]);
  //console.log(auction && auction.bidIncrementPriceList);

  const nextBid =
    auction &&
    maxBidPriceByCurrentLot &&
    Math.min(
      ...auction.bidIncrementPriceList.filter(
        (x) => x > maxBidPriceByCurrentLot.bidPrice
      )
    );

  //   auction.bidIncrementPriceList.sort((a, b) => a - b);
  //console.log("nextBid", nextBid);

  useEffect(() => {
    if (
      isAuthenticated !== null &&
      auctionsID &&
      fetchBidItemHistoriesStatus !== "succeeded"
    ) {
      dispatch(fetchBidItemHistories({ isAuthenticated, auctionsID }));
    }
  }, [dispatch, isAuthenticated, auctionsID, fetchBidItemHistoriesStatus]);
  //console.log("bitItemHistories", bitItemHistories);

  useEffect(() => {
    if (isAuthenticated !== null) {
      //console.log("start subscription++++++");
      const onCreateBidItemHistorySub = API.graphql({
        query: onCreateBidItemHistory,
        authMode: isAuthenticated ? undefined : "AWS_IAM",
      }).subscribe({
        next: ({ value }) => {
          //console.log(value);
          dispatch(insertBidItemHistory(value.data.onCreateBidItemHistory));
        },
        error: (error) => console.warn(error),
      });

      return () => {
        onCreateBidItemHistorySub.unsubscribe();
        console.log("close subscription");
      };
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated !== null) {
      //console.log("start subscription++++++");
      const onUpdateBidItemHistorySub = API.graphql({
        query: onUpdateBidItemHistory,
        authMode: isAuthenticated ? undefined : "AWS_IAM",
      }).subscribe({
        next: ({ value }) => {
          //console.log(value);
          dispatch(insertBidItemHistory(value.data.onUpdateBidItemHistory));
        },
        error: (error) => console.warn(error),
      });

      return () => {
        onUpdateBidItemHistorySub.unsubscribe();
        console.log("close subscription");
      };
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated !== null) {
      //console.log("start update lots subscription++++++");
      const onUpdateLotsSub = API.graphql({
        query: onUpdateLots,
        authMode: isAuthenticated ? undefined : "AWS_IAM",
      }).subscribe({
        next: ({ value }) => {
          console.log(value);
          dispatch(updateLotsDetailBySub(value.data.onUpdateLots));
        },
        error: (error) => console.warn(error),
      });

      return () => {
        onUpdateLotsSub.unsubscribe();
        console.log("close subscription");
      };
    }
  }, [isAuthenticated, dispatch]);

  const handleBitClick = async () => {
    setLoading(true);
    const createBidItemHistoryInput = {
      id:
        lotInProgress.length === 1 &&
        `${lotInProgress[0].id}-${
          nextBid ? nextBid : lotInProgress[0].startingPrice
        }`,
      bidPrice: nextBid ? nextBid : lotInProgress[0].startingPrice,
      auctionsID: auctionsID,
      lotsID: lotInProgress.length === 1 && lotInProgress[0].id,
      bidForm: "Internet",
      userNumber: auction.auctionUserNumbers.items[0].number,
    };
    const response = await dispatch(
      postBidItemHistory({ createBidItemHistoryInput })
    );
    //console.log(response.meta.requestStatus);
    if (response.meta.requestStatus === "fulfilled") {
      setLoading(false);
      setAlertStatus({ isOpen: true, isSuccess: true, sentence: "投标成功" });
    } else {
      setLoading(false);
      setAlertStatus({ isOpen: true, isSuccess: false, sentence: "投标失敗" });
    }
  };

  // console.log("imgUrls", lotInProgress[0].auctionItem.imgUrls);

  const imgListInProgress =
    lotInProgress.length === 1 &&
    lotInProgress[0].auctionItem.imgUrls.map((url) => {
      return { original: url, thumbnail: url };
    });
  //console.log(imgListInProgress);

  return (
    <>
      {/* <AdminLotsGrid /> */}
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {lotInProgress.length === 1 ? (
          <Box sx={{ m: "1rem" }}>
            <Box className={classes.glary}>
              <ImageGallery
                showFullscreenButton={true}
                showPlayButton={false}
                showIndex={true}
                startIndex={0}
                thumbnailPosition={"left"}
                items={imgListInProgress}
                originalHeight={"500px"}
                thumbnailHeight={"500px"}
              />
            </Box>
            {/* <Box>
              <H2>
                <Card sx={{ minWidth: 275 }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                      >
                        Lot: {lotInProgress[0].lot}
                      </Typography>
                      <Typography color="text.secondary">
                        Title: {lotInProgress[0].auctionItem.title}
                      </Typography>
                      <Typography color="text.secondary">
                        Name: {lotInProgress[0].auctionItem.name}
                      </Typography>
                      <Typography variant="body2">
                        Starting Price: {lotInProgress[0].startingPrice}
                      </Typography>
                      <Typography variant="body2">
                        Category: {lotInProgress[0].auctionItem.categoryID}
                      </Typography>
                      <Typography variant="body2">
                        Description: {lotInProgress[0].auctionItem.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </H2>
            </Box> */}
            <Box sx={{ textAlign: "center", my: "2rem" }}>
              <Paper sx={{ maxWidth: "500px", margin: "auto" }}>
                <H1 color="secondary.500" mb="0.2rem">
                  Current Bid is: $
                  {maxBidPriceByCurrentLot
                    ? Number(maxBidPriceByCurrentLot.bidPrice)
                        .toFixed(2)
                        .replace(/\d(?=(\d{3})+\.)/g, "$&,")
                    : 0}{" "}
                  (CAD)
                </H1>
              </Paper>
              <Paper sx={{ maxWidth: "500px", margin: "auto" }}>
                <H1 color="secondary.500" mb="0.2rem">
                  Next Bid is: $
                  {nextBid
                    ? nextBid.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")
                    : lotInProgress[0].startingPrice
                        .toFixed(2)
                        .replace(/\d(?=(\d{3})+\.)/g, "$&,")}{" "}
                  (CAD)
                </H1>
              </Paper>
              {maxBidPriceByCurrentLot &&
                maxBidPriceByCurrentLot.userNumber ===
                  auction.auctionUserNumbers.items[0].number && (
                  <Paper
                    sx={{
                      maxWidth: "500px",
                      margin: "auto",
                      backgroundColor: "green",
                    }}
                  >
                    <H1 color="" mb="0.2rem">
                      You are the highest bidder now
                    </H1>
                  </Paper>
                )}
              {!cognitoGroup.includes("admin") && (
                <BazarButton
                  variant="contained"
                  onClick={handleBitClick}
                  color="primary"
                  size="large"
                  fullWidth={true}
                  disabled={isAuthenticated !== true || loading}
                >
                  Bid
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
              )}
            </Box>
            {isAuthenticated && !cognitoGroup.includes("admin") && (
              <Paper sx={{ p: "2rem", m: "1rem" }}>
                <H3>My Status:</H3>
                <Box sx={{ pl: "2rem" }}>
                  My Limitation:{" "}
                  {auction &&
                    auction.auctionUserLimitations &&
                    auction.auctionUserLimitations.items.length !== 0 &&
                    auction.auctionUserLimitations.items[0].maxUserBidPrice}
                  <br />
                  My Auction User Number:{" "}
                  {auction &&
                    auction.auctionUserNumbers &&
                    auction.auctionUserNumbers.items.length !== 0 &&
                    auction.auctionUserNumbers.items[0].number}
                </Box>
              </Paper>
            )}
          </Box>
        ) : (
          <Typography variant="h3">Waiting</Typography>
        )}

        <Box
          sx={{
            width: "300px",
            maxHeight: "500px",
            overflow: "auto",
            mx: "2rem",
            py: "2rem",
          }}
        >
          <div ref={messageRef}>
            <BidItemHistoriesRenderList bitItemHistories={bitItemHistories} />
          </div>
        </Box>
      </Box>
      {cognitoGroup.includes("admin") && (
        <Box sx={{ my: "2rem" }}>
          <AdminActions
            auctionsID={auctionsID}
            nextBid={
              nextBid
                ? nextBid
                : lotInProgress[0] && lotInProgress[0].startingPrice
            }
          />
          <AdminTable />
        </Box>
      )}

      {/* <LotssRenderList lotss={lotss} /> */}

      {/* {lotssRenderList} */}
      {/* <Box sx={{ height: "600px", textAlign: "center" }}>
        <CircularProgress color="inherit" sx={{ mt: "300px" }} />
      </Box> */}
      <Snackbar
        //   anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        //{isOpen:true,isSuccess:true,sentence:'投标成功'}
        open={alertStatus.isOpen}
        autoHideDuration={3000}
        onClose={handleAlertClose}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertStatus.isSuccess ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {alertStatus.sentence}
        </Alert>
      </Snackbar>
    </>
  );
}
