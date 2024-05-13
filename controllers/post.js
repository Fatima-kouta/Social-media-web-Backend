import moment from "moment";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getPosts = (req, res) => {

  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    console.log("token",token);
    console.log("userId",userInfo);
// p.* selects all columns from the posts table.
// JOIN users AS u ON (u.id = p.userId): This is an inner join between the posts and users tables based on the 
// condition that u.id (from the users table) is equal to p.userId (from the posts table).
    const q =
      userId !== "undefined"
        ? `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
        : `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
    LEFT JOIN relationships AS r ON (p.userId = r.followedUser) WHERE r.followerUser= ? OR p.userId =?
    ORDER BY p.createdAt DESC`;

    const values =
      userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};
export const addPost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (dbErr, data) => {
      if (dbErr) {
        console.error("Error inserting post into database:", dbErr);
        return res.status(500).json("Internal Server Error");
      }

      return res.status(200).json("Post has been created.");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;

    // Delete likes associated with the post
    const deleteLikesQuery = "DELETE FROM likes WHERE likePostId = ?";
    db.query(deleteLikesQuery, [postId], (err) => {
      if (err) return res.status(500).json(err);

      // Now delete the post
      const deletePostQuery = "DELETE FROM posts WHERE id = ? AND userId = ?";
      db.query(deletePostQuery, [postId, userInfo.id], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows > 0) return res.status(200).json("Post has been deleted.");
        return res.status(403).json("You can delete only your post");
      });
    });
  });
};