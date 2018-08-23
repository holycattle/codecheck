//$Id$
package com.zoho.cide.ot;
import java.util.LinkedList;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import name.fraser.neil.plaintext.diff_match_patch.Diff;
import name.fraser.neil.plaintext.diff_match_patch.Operation;

import OT;
/**
 * This class represents a single operation that the user makes to a document. This class contains all the core logic of Operational transformation
 * like Transform, compose etc.
 * 
 * @author manoj-3097
 *
 */
public class OT {
	private static final Logger LOGGER = Logger.getLogger(OT.class.getName());
	private long version;
	private int revision;
	private long zuid;
	private long baseLength;
	private long targetLength;
	private JSONArray docOps;
	private String userKey;
	private boolean saveRevision;
	private Long time;

        public OT() {
		this.docOps = new JSONArray();
		this.baseLength = 0;
	}

	public OT(long version, int revision, String userKey, Long time) {
		this.version = version;
		this.revision = revision;
		this.zuid = zuid;
	
	}

	public OT(JSONObject opJson) throws JSONException {
		this.version = opJson.getLong("ver"); // No i18N
		this.revision = opJson.getInt("rev"); // No i18N
		this.zuid = opJson.getLong("zuid"); // No i18N
		this.docOps = opJson.getJSONArray("ops"); // No i18N
		this.baseLength = opJson.getLong("bl"); // No i18N
		this.targetLength = opJson.getLong("tl"); // No i18N
		this.saveRevision = opJson.optBoolean("sr"); // No i18N
		this.time = opJson.optLong("time"); // No i18N
	}

	/**
	 * Convert an Operation to JSONObject
	 * 
	 * @return
	 * @throws JSONException
	 */
	public JSONObject toJSON() throws JSONException {
		JSONObject JSONObj = new JSONObject();
		JSONObj.put("ver", this.version);
		JSONObj.put("rev", this.revision);
		JSONObj.put("zuid", this.zuid);
		JSONObj.put("ops", this.docOps);
		JSONObj.put("bl", this.baseLength);
		JSONObj.put("tl", this.targetLength);
		JSONObj.put("sr", this.saveRevision);
		JSONObj.put("time", this.time);
		return JSONObj;
	}

	/**
	 * Convert an operation to string
	 */
	@Override
	public String toString() {
		JSONObject JSONObj = null;
		try {
			JSONObj = this.toJSON();
		} catch (JSONException e) {
		}
		return JSONObj.toString();
	}

	public int getRevision() {
		return this.revision;
	}

	public long getVersion() {
		return this.version;
	}

	public long getZUID() {
		return this.zuid;
	}

	public long getTime() {
		return this.time;
	}

	public JSONArray getDocOps() {
		return this.docOps;
	}

	public long getBaseLength() {
		return this.baseLength;
	}

	public long getTargetLength() {
		return this.targetLength;
	}

	public String getUserKey() {
		return this.userKey;
	}

	public void setZUID(long zuid) {
		this.zuid = zuid;
	}

	public void setRevision(int revision) {
		this.revision = revision;
	}

	public void setVersion(long version) {
		this.version = version;
	}

	public void setDocOps(JSONArray docOps) {
		this.docOps = docOps;
	}

	public void setSaveRevision() {
		this.saveRevision = true;
	}

	public void setTime(Long time) {
		this.time = time;
	}

	public boolean isSaveRevision() {
		return this.saveRevision;
	}

	/**
	 * Set next revision to the current OT object
	 */
	public void setNextRevision() {
		if (this.revision < 100) {
			this.setRevision(this.revision + 1);
		} else {
			this.setRevision(1);
			this.setVersion(this.version + 1);
		}
	}

	/**
	 * Compose an operation with the next consecutive operation and return a single operation, This should preserve the changes of both. Or, in other
	 * words, for each input string S and a pair of consecutive operations A and B, apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
	 * 
	 * @param operation2
	 * @return
	 * @throws JSONException
	 */
	public OT compose(OT operation2) throws JSONException {
		OT operation1 = this;
		/*
		 * The primary condition for composing is the base length of the operation must be equal to the target length of the operation over which we
		 * are composing.
		 */
		if (operation1.targetLength != operation2.baseLength) {
			LOGGER.log(Level.SEVERE, "Compose failed: Target length and base length check failure: " + operation1.toString() + operation2.toString());
			return null;
		}
		// Initiate an empty OT object
		OT operation = new OT();
		JSONArray ops1 = operation1.getDocOps();
		JSONArray ops2 = operation2.getDocOps();
		int i1 = 0, i2 = 0;
		TextOp op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
		TextOp op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
		while (true) {

			// TextOps of both the operations are processed. Break the loop.
			if (op1 == null && op2 == null) {
				break;
			}
			if (op1 != null && op1.isDelete()) {
				operation.delete(op1.getText());
				op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				continue;
			}
			if (op2 != null && op2.isInsert()) {
				operation.insert(op2.getText());
				op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				continue;
			}
			if (op1 == null) {
				LOGGER.log(Level.SEVERE, "Compose failed: " + operation1.toString() + operation2.toString());
				return null;
			}
			if (op2 == null) {
				LOGGER.log(Level.SEVERE, "Compose failed: " + operation1.toString() + operation2.toString());
				return null;
			}
			if (op1.isRetain() && op2.isRetain()) {
				if (op1.getChars() > op2.getChars()) {
					operation.retain(op2.getChars());
					op1.removeRetainChars(op2.getChars());
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getChars() == op2.getChars()) {
					operation.retain(op1.getChars());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					operation.retain(op1.getChars());
					op2.removeRetainChars(op1.getChars());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
			} else if (op1.isInsert() && op2.isDelete()) {
				if (op1.getText().length() > op2.getText().length()) {
					op1.setText(op1.getText().substring(op2.getText().length()));
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getText().length() == op2.getText().length()) {
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					op2.setText(op2.getText().substring(op1.getText().length()));
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
			} else if (op1.isInsert() && op2.isRetain()) {
				if (op1.getText().length() > op2.getChars()) {
					operation.insert(op1.getText().substring(0, (int) op2.getChars()));
					op1.setText(op1.getText().substring((int) op2.getChars()));
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getText().length() == op2.getChars()) {
					operation.insert(op1.getText());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					operation.insert(op1.getText());
					op2.removeRetainChars(op1.getText().length());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
			} else if (op1.isRetain() && op2.isDelete()) {
				if (op1.getChars() > op2.getText().length()) {
					operation.delete(op2.getText());
					op1.removeRetainChars(op2.getText().length());
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getChars() == op2.getText().length()) {
					operation.delete(op2.getText());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					operation.delete(op2.getText().substring(0, (int) op1.getChars()));
					op2.setText(op2.getText().substring((int) op1.getChars()));
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
			} else {
				LOGGER.log(Level.SEVERE, "Compose failed: " + operation1.toString() + operation2.toString());
				return null;
			}
		}
		operation.setDocOps(docOpsTOJSONArray(operation.getDocOps()));
		return operation;
	}

	/**
	 * Transform an operation over another operation occurred concurrently at the same point of time. This function has the main logic of OT.
	 * 
	 * @param operation1
	 * @param operation2
	 * @return
	 * @throws JSONException
	 */
	public JSONArray transform(OT operation1, OT operation2) throws JSONException {
		/*
		 * The primary condition for transforming is the base length of the operation must be equal to the base length of the operation for which we
		 * are transforming.
		 */
		if (operation1.baseLength != operation2.baseLength) {
			LOGGER.log(Level.SEVERE, "Transform failed: Base Length check failure: " + operation1.toString() + operation2.toString());
			return null;
		}
		// Initiate empty OT objects for transformation
		OT operation1prime = new OT();
		OT operation2prime = new OT();
		JSONArray ops1 = operation1.getDocOps();
		JSONArray ops2 = operation2.getDocOps();
		int i1 = 0, i2 = 0;
		TextOp op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
		TextOp op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
		while (true) {
			/*
			 * We can break the loop once we have processed both the docOps
			 */
			if (op1 == null && op2 == null) {
				break;
			}
			/*
			 * First two cases are insert operation.
			 */
			if (op1 != null && op1.isInsert()) {
				operation1prime.insert(op1.getText());
				operation2prime.retain(op1.getText().length());
				op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				continue;
			}
			if (op2 != null && op2.isInsert()) {
				operation1prime.retain(op2.getText().length());
				operation2prime.insert(op2.getText());
				op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				continue;
			}
			if (op1 == null) {
				LOGGER.log(Level.SEVERE, "Transform failed: " + operation1.toString() + operation2.toString());
				return null;
			}
			if (op2 == null) {
				LOGGER.log(Level.SEVERE, "Transform failed: " + operation1.toString() + operation2.toString());
				return null;
			}
			Integer minl;
			/*
			 * Possible combinations of Retain and Delete in both the operations.
			 */
			if (op1.isRetain() && op2.isRetain()) {
				// Retain and Retain
				if (op1.getChars() > op2.getChars()) {
					minl = op2.getChars();
					op1.removeRetainChars(op2.getChars());
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getChars() == op2.getChars()) {
					minl = op2.getChars();
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					minl = op1.getChars();
					op2.removeRetainChars(op1.getChars());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
				operation1prime.retain(minl);
				operation2prime.retain(minl);
			} else if (op1.isDelete() && op2.isDelete()) {
				// Delete and Delete
				if (op1.getText().length() > op2.getText().length()) {
					op1.setText(op1.getText().substring(op2.getText().length(), op1.getText().length()));
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getText().length() == op2.getText().length()) {
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					op2.setText(op2.getText().substring(op1.getText().length(), op2.getText().length()));
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
			} else if (op1.isDelete() && op2.isRetain()) {
				// Delete and Retain
				minl = Math.min(op1.getText().length(), op2.getChars());
				operation1prime.delete(op1.getText().substring(0, (int) minl));
				if (op1.getText().length() > op2.getChars()) {
					op1.setText(op1.getText().substring((int) op2.getChars(), op1.getText().length()));
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getText().length() == op2.getChars()) {
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					op2.removeRetainChars(op1.getText().length());
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}
			} else if (op1.isRetain() && op2.isDelete()) {
				// Retain and Delete
				minl = Math.min(op1.getChars(), op2.getText().length());
				operation2prime.delete(op2.getText().substring(0, (int) minl));
				if (op1.getChars() > op2.getText().length()) {
					op1.removeRetainChars(op2.getText().length());
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else if (op1.getChars() == op2.getText().length()) {
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
					op2 = ops2.length() > i2 ? new TextOp(ops2.getJSONObject(i2++)) : null;
				} else {
					op2.setText(op2.getText().substring((int) minl, op2.getText().length()));
					op1 = ops1.length() > i1 ? new TextOp(ops1.getJSONObject(i1++)) : null;
				}

			} else {
				LOGGER.log(Level.SEVERE, "Transform failed: " + operation1.toString() + operation2.toString());
				return null;
			}
		}
		JSONArray transformed = new JSONArray();
		operation1prime.setDocOps(docOpsTOJSONArray(operation1prime.getDocOps()));
		operation2prime.setDocOps(docOpsTOJSONArray(operation2prime.getDocOps()));
		transformed.put(operation1prime);
		transformed.put(operation2prime);
		return transformed;
	}

	/**
	 * Add an insert TextOp to the OT object
	 * 
	 * @param str
	 * @return
	 * @throws JSONException
	 */
	public OT insert(String str) throws JSONException {
		if (str.length() == 0) {
			return this;
		}
		this.targetLength = this.targetLength + str.length();

		TextOp prevOp = this.getDocOps().length() > 0 ? (TextOp) this.getDocOps().get(this.getDocOps().length() - 1) : null;
		TextOp prevPrevOp = this.getDocOps().length() > 1 ? (TextOp) this.getDocOps().get(this.getDocOps().length() - 2) : null;

		/*
		 * Append the text to previous op if it is an insert Op.
		 */
		if (prevOp != null && prevOp.isInsert()) {
			prevOp.appendText(str);
		} else if (prevOp != null && prevOp.isDelete()) {
			/*
			 * It doesn't matter when an operation is applied whether the operation is delete(3), insert("something") or insert("something"),
			 * delete(3). Here we enforce that in this case, the insert op always comes first. This makes all operations that have the same effect
			 * when applied to a document of the right length equal in respect to the `equals` method.
			 */
			if (prevPrevOp != null && prevPrevOp.isInsert()) {
				prevPrevOp.appendText(str);
			} else {
				JSONArray docOps = this.getDocOps();
				docOps.put(this.getDocOps().length() - 1, new TextOp("i", null, str));
				docOps.put(prevOp);
				this.setDocOps(docOps);
			}
		} else {
			JSONArray docOps = this.getDocOps();
			docOps.put(new TextOp("i", null, str));
			this.docOps = docOps;
		}
		return this;
	}

	/**
	 * Add a retain TextOp to the OT object
	 * 
	 * @param n
	 * @return
	 * @throws JSONException
	 */
	public OT retain(Integer n) throws JSONException {
		if (n == 0) {
			return this;
		}

		/*
		 * Since it is a retain operation it is not going to change the content. It will just change the imaginary cursor. So we need to increase both
		 * the base length and target length.
		 */
		this.baseLength = this.baseLength + n;
		this.targetLength = this.targetLength + n;

		TextOp prevOp = this.getDocOps().length() > 0 ? (TextOp) this.getDocOps().get(this.getDocOps().length() - 1) : null;

		if (prevOp != null && prevOp.isRetain()) {
			/*
			 * If the previous TextOp exists for the operation and it is a retain op we can simple add the retain characters to that TextOp.
			 */
			prevOp.addRetainChars(n);
		} else {
			/*
			 * Add a new retain Op if previous TextOp does not exist or if it is not a retain Op.
			 */
			JSONArray docOps = this.getDocOps();
			docOps.put(new TextOp("r", n, null));
			this.docOps = docOps;
		}
		return this;
	}

	/**
	 * Add a delete TextOp to the OT object
	 * 
	 * @param n
	 * @return
	 * @throws JSONException
	 */
	public OT delete(String str) throws JSONException {
		long n = str.length();
		if (n == 0) {
			return this;
		}
		/*
		 * Increment the base length of the operation. Let the current content be "ABCDE" and we are deleting "DE" from the given text. We have to
		 * retain 3 characters and we have to add a delete TextOP for 2 characters. The base length will be 5 and target length will be 3. We would
		 * have already processed RETAIN 3. The base length will now be 3 and target length will be 3. Now increment the base length by the given
		 * value to reach the required base length. No need to change target length for Delete Op.
		 */
		this.baseLength = this.baseLength + n;

		TextOp prevOp = (this.getDocOps().length() > 0) ? (TextOp) this.getDocOps().get(this.getDocOps().length() - 1) : null;

		if (prevOp != null && prevOp.isDelete()) {
			/*
			 * If the previous TextOp exists for the operation and it is a delete op we can simple add the retain characters to that TextOp.
			 */
			prevOp.appendText(str);
		} else {
			/*
			 * Add a new delete Op if previous TextOp does not exist or if it is not a delete Op.
			 */
			JSONArray docOps = this.getDocOps();
			docOps.put(new TextOp("d", null, str));
			this.docOps = docOps;
		}
		return this;
	}

	/**
	 * Apply and operation to a text and return the resulting text
	 * 
	 * @param str
	 * @param operation
	 * @return
	 * @throws JSONException
	 */
	public static String applyOperationtoStr(String str, OT operation) throws JSONException {
		JSONArray docOps = operation.getDocOps();
		int opLength = docOps.length();
		int index = 0;
		for (int i = 0; i < opLength; i++) {
			JSONObject op = docOps.getJSONObject(i);
			String opType = op.getString("o"); // NO i18N
			String opText = op.optString("t"); // NO i18N
			String content = str;
			switch (opType) {
			case "r": // Retain
				index += op.getInt("c"); // NO i18N
				break;
			case "i": // Insert
				str = content.substring(0, index) + opText + content.substring(index, content.length());
				index += opText.length();
				break;
			case "d": // Delete
				int from = index;
				int to = index + opText.length();
				str = content.substring(0, from) + content.substring(to, content.length());
				break;
			}
		}
		return str;
	}

	/**
	 * Concise a series of operations before pushing it to DB
	 * 
	 * @param operations
	 * @return
	 * @throws Exception
	 */
	public static JSONArray conciseOperations(JSONArray operations) throws Exception {
		JSONArray concisedOps = new JSONArray();
		if (operations.length() == 0) {
			return concisedOps;
		}
		OT baseOp = new OT(operations.getJSONObject(0));
		int opLength = operations.length();
		for (int i = 1; i < opLength; i++) {
			OT nextOp = new OT(operations.getJSONObject(i));
			if (baseOp.getZUID() == nextOp.getZUID() && baseOp.getVersion() == nextOp.getVersion() && !baseOp.isSaveRevision()) {
				baseOp = baseOp.compose(nextOp);
				baseOp.setZUID(nextOp.getZUID());
				baseOp.setRevision(nextOp.getRevision());
				baseOp.setVersion(nextOp.getVersion());
				baseOp.setTime(nextOp.getTime());
				if (nextOp.isSaveRevision()) {
					baseOp.setSaveRevision();
				}
			} else {
				if (isValidOp(baseOp)) {
					concisedOps.put(baseOp.toJSON());
				}
				baseOp = nextOp;
			}
		}
		if (isValidOp(baseOp)) {
			concisedOps.put(baseOp.toJSON());
		}
		return concisedOps;
	}

	/**
	 * Check if an operation is valid to apply. An operation which consists of only the retain ops doesn't make any sense to apply are not valid. This
	 * method is used before pushing composed ops to DB.
	 * 
	 * @param op
	 * @return
	 * @throws JSONException
	 */
	public static boolean isValidOp(OT op) throws JSONException {
		JSONArray ops = op.getDocOps();
		int opLength = ops.length();
		for (int i = 0; i < opLength; i++) {
			TextOp txtOp = new TextOp(ops.getJSONObject(i));
			if (txtOp.isInsert() || txtOp.isDelete()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Convert diffs calculates by Google diff match to OT object
	 * 
	 * @param diffs
	 * @return
	 * @throws JSONException
	 */
	public static OT diffsToOperations(LinkedList<Diff> diffs) throws JSONException {
		OT operation = new OT();
		/*
		 * Iterate through the diffs and add appropriate TextOp based on the type of the operation of the diff.
		 */
		for (Diff diff : diffs) {
			Operation op = diff.operation;
			String opText = diff.text;
			switch (op) {
			case INSERT:
				operation.insert(opText);
				break;
			case DELETE:
				operation.delete(opText);
				break;
			case EQUAL:
				operation.retain(opText.length());
				break;
			}
		}
		operation.setDocOps(operation.docOpsTOJSONArray(operation.getDocOps()));
		return operation;
	}

	/**
	 * Convert JSONArray of TextOp objects to JSONArray of JSONObjects
	 * 
	 * @param docOps
	 * @return
	 * @throws JSONException
	 */
	private JSONArray docOpsTOJSONArray(JSONArray docOps) throws JSONException {
		JSONArray docOpsArr = new JSONArray();
		for (int i = 0; i < docOps.length(); i++) {
			docOpsArr.put(((TextOp) docOps.get(i)).toJSON());
		}
		return docOpsArr;
	}

}