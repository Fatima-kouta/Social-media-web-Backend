import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getLikes = (req,res)=>{
    const q = "SELECT * FROM likes WHERE likePostId = ?";
    db.query(q, [req.query.likePostId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map(like=>like.likeUserId));
    });
}

export const addLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO likes (`likeUserId`,`likePostId`) VALUES (?)";
    const values = [
        req.body.likeUserId,
      req.body.likePostId
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been liked.");
    });
  });
};

export const deleteLike = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const q = "DELETE FROM likes WHERE `likeUserId` = ? AND `likePostId` = ?";
  
      db.query(q, [userInfo.id, req.body.likePostId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Post has been disliked.");
      });
    });
  };
  