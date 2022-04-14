/*
 * @Author: 李佳修
 * @Date: 2022-04-12 17:49:45
 * @LastEditTime: 2022-04-13 09:12:20
 * @LastEditors: 李佳修
 * @FilePath: /bhpmJS/frontend/src/pages/auctions/BiddingTitle.js
 */
import { H1 } from "../../components/Typography";
import { Typography } from "@mui/material";
export default function BiddingTitle(props) {
    return (
        <div style={{ width: "100%" }}>
            <H1>{props.title}</H1>
            <Typography sx={{ color: "gray" }}>{props.description}</Typography>
            <Typography sx={{ color: "gray" }}>创建时间：{Date(props.createdAt)}</Typography>
        </div>
    )
}