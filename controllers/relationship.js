import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getRelationships = (req,res)=>{
    const q = "SELECT followerUser FROM relationships WHERE followedUser = ?";

    db.query(q, [req.query.followedUser], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map(relationship=>relationship.followerUser));
    });
}

export const addRelationship = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO relationships (`followerUser`,`followedUser`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.followedUser
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Following");
    });
  });
};

export const deleteRelationship = (req, res) => {

  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM relationships WHERE `followerUser` = ? AND `followedUser` = ?";

    db.query(q, [userInfo.id, req.query.followedUser], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Unfollow");
    });
  });
};